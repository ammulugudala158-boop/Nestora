import { Router, type IRouter } from "express";
import { eq, count, sum } from "drizzle-orm";
import { db, usersTable, ordersTable } from "@workspace/db";
import { GetCustomerParams } from "@workspace/api-zod";
import { authenticate, requireOwner, type AuthRequest } from "../middlewares/authenticate";

const router: IRouter = Router();

async function enrichCustomer(u: typeof usersTable.$inferSelect) {
  const [stats] = await db.select({ cnt: count(), total: sum(ordersTable.total) })
    .from(ordersTable).where(eq(ordersTable.customerId, u.id));
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    loyaltyPoints: u.loyaltyPoints,
    totalOrders: Number(stats?.cnt ?? 0),
    totalSpent: parseFloat(stats?.total as string ?? "0"),
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/customers", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const customers = await db.select().from(usersTable).where(eq(usersTable.role, "customer"));
  res.json(await Promise.all(customers.map(enrichCustomer)));
});

router.get("/customers/:id", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json(await enrichCustomer(user));
});

export default router;
