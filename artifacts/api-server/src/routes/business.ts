import { Router, type IRouter } from "express";
import { db, businessTable } from "@workspace/db";
import { UpdateBusinessBody } from "@workspace/api-zod";
import { authenticate, requireOwner, type AuthRequest } from "../middlewares/authenticate";

const router: IRouter = Router();

router.get("/business", async (_req, res): Promise<void> => {
  const [biz] = await db.select().from(businessTable);
  if (!biz) {
    // Return default
    res.json({ id: 0, name: "Nestora Business", tagline: null, description: null, logo: null, address: null, city: null, phone: null, email: null, website: null, workingHours: null, gstNumber: null, currency: "INR", createdAt: new Date().toISOString() });
    return;
  }
  res.json({ ...biz, createdAt: biz.createdAt.toISOString(), updatedAt: undefined });
});

router.put("/business", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const parsed = UpdateBusinessBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [existing] = await db.select().from(businessTable);
  if (!existing) {
    const [biz] = await db.insert(businessTable).values({ ...parsed.data }).returning();
    res.json({ ...biz, createdAt: biz.createdAt.toISOString() });
    return;
  }

  const [biz] = await db.update(businessTable).set(parsed.data).returning();
  res.json({ ...biz, createdAt: biz.createdAt.toISOString() });
});

export default router;
