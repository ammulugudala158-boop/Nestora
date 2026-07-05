import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { MarkNotificationReadParams } from "@workspace/api-zod";
import { authenticate, type AuthRequest } from "../middlewares/authenticate";

const router: IRouter = Router();

router.get("/notifications", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const rows = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, req.userId!))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);
  res.json(rows.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })));
});

router.patch("/notifications/:id/read", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [notif] = await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, params.data.id)).returning();
  if (!notif) { res.status(404).json({ error: "Notification not found" }); return; }
  res.json({ ...notif, createdAt: notif.createdAt.toISOString() });
});

export default router;
