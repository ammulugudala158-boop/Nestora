import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, ticketsTable, ticketRepliesTable, usersTable, notificationsTable } from "@workspace/db";
import { CreateTicketBody, GetTicketParams, ReplyToTicketBody, ReplyToTicketParams } from "@workspace/api-zod";
import { authenticate, type AuthRequest } from "../middlewares/authenticate";

const router: IRouter = Router();

async function formatTicket(t: typeof ticketsTable.$inferSelect) {
  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, t.customerId));
  const replies = await db.select().from(ticketRepliesTable).where(eq(ticketRepliesTable.ticketId, t.id)).orderBy(ticketRepliesTable.createdAt);
  const enrichedReplies = await Promise.all(replies.map(async r => {
    const [author] = await db.select().from(usersTable).where(eq(usersTable.id, r.authorId));
    return { ...r, authorName: author?.name ?? "User", createdAt: r.createdAt.toISOString() };
  }));
  return {
    ...t,
    customerName: customer?.name ?? "Customer",
    replies: enrichedReplies,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

router.get("/tickets", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const isOwner = req.userRole === "owner";
  const rows = isOwner
    ? await db.select().from(ticketsTable).orderBy(desc(ticketsTable.createdAt))
    : await db.select().from(ticketsTable).where(eq(ticketsTable.customerId, req.userId!)).orderBy(desc(ticketsTable.createdAt));
  res.json(await Promise.all(rows.map(formatTicket)));
});

router.post("/tickets", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [ticket] = await db.insert(ticketsTable).values({
    customerId: req.userId!,
    subject: parsed.data.subject,
    message: parsed.data.message,
    status: "open",
  }).returning();
  res.status(201).json(await formatTicket(ticket));
});

router.get("/tickets/:id", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const params = GetTicketParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, params.data.id));
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }
  if (req.userRole !== "owner" && ticket.customerId !== req.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  res.json(await formatTicket(ticket));
});

router.post("/tickets/:id/reply", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const params = ReplyToTicketParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = ReplyToTicketBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, params.data.id));
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }

  const [reply] = await db.insert(ticketRepliesTable).values({
    ticketId: params.data.id,
    authorId: req.userId!,
    authorRole: req.userRole!,
    message: parsed.data.message,
  }).returning();

  // Update ticket status
  if (req.userRole === "owner") {
    await db.update(ticketsTable).set({ status: "in_progress" }).where(eq(ticketsTable.id, params.data.id));
    await db.insert(notificationsTable).values({
      userId: ticket.customerId,
      title: "Support Reply",
      message: `Your ticket "${ticket.subject}" has a new reply.`,
      type: "ticket",
    });
  }

  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  res.status(201).json({ ...reply, authorName: author?.name ?? "User", createdAt: reply.createdAt.toISOString() });
});

export default router;
