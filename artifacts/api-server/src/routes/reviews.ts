import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { CreateReviewBody, ListReviewsQueryParams } from "@workspace/api-zod";
import { authenticate, type AuthRequest } from "../middlewares/authenticate";

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const params = ListReviewsQueryParams.safeParse(req.query);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const rows = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, params.data.productId));
  const enriched = await Promise.all(rows.map(async r => {
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, r.customerId));
    return { ...r, customerName: u?.name ?? "Customer", createdAt: r.createdAt.toISOString() };
  }));
  res.json(enriched);
});

router.post("/reviews", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [review] = await db.insert(reviewsTable).values({
    productId: parsed.data.productId,
    customerId: req.userId!,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
  }).returning();
  const [u] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  res.status(201).json({ ...review, customerName: u?.name ?? "Customer", createdAt: review.createdAt.toISOString() });
});

export default router;
