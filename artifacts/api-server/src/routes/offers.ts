import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, offersTable } from "@workspace/db";
import { CreateOfferBody, UpdateOfferBody, UpdateOfferParams, DeleteOfferParams, ValidateCouponBody } from "@workspace/api-zod";
import { authenticate, requireOwner, type AuthRequest } from "../middlewares/authenticate";

const router: IRouter = Router();

function fmt(o: typeof offersTable.$inferSelect) {
  return { ...o, createdAt: o.createdAt.toISOString() };
}

router.get("/offers", async (_req, res): Promise<void> => {
  const rows = await db.select().from(offersTable).orderBy(offersTable.createdAt);
  res.json(rows.map(fmt));
});

router.post("/offers", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateOfferBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [offer] = await db.insert(offersTable).values({
    ...parsed.data,
    isActive: parsed.data.isActive ?? true,
    usedCount: 0,
  }).returning();
  res.status(201).json(fmt(offer));
});

router.patch("/offers/:id", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateOfferParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateOfferBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [offer] = await db.update(offersTable).set(parsed.data).where(eq(offersTable.id, params.data.id)).returning();
  if (!offer) { res.status(404).json({ error: "Offer not found" }); return; }
  res.json(fmt(offer));
});

router.delete("/offers/:id", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteOfferParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(offersTable).where(eq(offersTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/offers/validate", async (req, res): Promise<void> => {
  const parsed = ValidateCouponBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [offer] = await db.select().from(offersTable).where(eq(offersTable.code, parsed.data.code));
  if (!offer || !offer.isActive) {
    res.status(404).json({ error: "Invalid or expired coupon" }); return;
  }
  res.json(fmt(offer));
});

export default router;
