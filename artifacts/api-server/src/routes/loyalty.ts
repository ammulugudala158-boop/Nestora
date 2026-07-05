import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, usersTable, loyaltyTransactionsTable } from "@workspace/db";
import { authenticate, type AuthRequest } from "../middlewares/authenticate";

const router: IRouter = Router();

router.get("/loyalty", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  const points = user?.loyaltyPoints ?? 0;
  res.json({ points, rupeesValue: points * 0.5 });
});

router.get("/loyalty/history", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const rows = await db.select().from(loyaltyTransactionsTable)
    .where(eq(loyaltyTransactionsTable.userId, req.userId!))
    .orderBy(desc(loyaltyTransactionsTable.createdAt));
  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

export default router;
