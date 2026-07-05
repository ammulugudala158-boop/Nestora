import { Router, type IRouter } from "express";
import { eq, count, sum, sql } from "drizzle-orm";
import { db, ordersTable, usersTable, productsTable } from "@workspace/db";
import { authenticate, requireOwner, type AuthRequest } from "../middlewares/authenticate";

const router: IRouter = Router();

router.get("/analytics/summary", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const [orderStats] = await db.select({
    total: sum(ordersTable.total),
    cnt: count(),
  }).from(ordersTable);

  const [pendingCount] = await db.select({ cnt: count() }).from(ordersTable).where(eq(ordersTable.status, "pending"));
  const [customerCount] = await db.select({ cnt: count() }).from(usersTable).where(eq(usersTable.role, "customer"));
  const [productCount] = await db.select({ cnt: count() }).from(productsTable);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [monthlyStats] = await db.select({ total: sum(ordersTable.total) }).from(ordersTable)
    .where(sql`${ordersTable.createdAt} >= ${startOfMonth}`);

  const totalRevenue = parseFloat(orderStats?.total as string ?? "0");
  const monthlyRevenue = parseFloat(monthlyStats?.total as string ?? "0");

  res.json({
    totalRevenue,
    totalOrders: Number(orderStats?.cnt ?? 0),
    totalCustomers: Number(customerCount?.cnt ?? 0),
    totalProducts: Number(productCount?.cnt ?? 0),
    pendingOrders: Number(pendingCount?.cnt ?? 0),
    monthlyRevenue,
    profit: totalRevenue * 0.35,
    expenses: totalRevenue * 0.65,
  });
});

router.get("/analytics/revenue", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const rows = await db.select({
    month: sql<string>`to_char(${ordersTable.createdAt}, 'Mon YYYY')`,
    revenue: sum(ordersTable.total),
    orders: count(),
  }).from(ordersTable)
    .groupBy(sql`to_char(${ordersTable.createdAt}, 'Mon YYYY'), date_trunc('month', ${ordersTable.createdAt})`)
    .orderBy(sql`date_trunc('month', ${ordersTable.createdAt})`);

  res.json(rows.map(r => ({
    month: r.month,
    revenue: parseFloat(r.revenue as string ?? "0"),
    orders: Number(r.orders ?? 0),
  })));
});

router.get("/analytics/top-products", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  // Aggregate from order items JSON
  const orders = await db.select().from(ordersTable);
  const productStats: Record<number, { name: string; imageUrl: string | null; totalSold: number; revenue: number }> = {};

  for (const order of orders) {
    const items = (order.items as any[]) ?? [];
    for (const item of items) {
      if (!productStats[item.productId]) {
        productStats[item.productId] = { name: item.productName, imageUrl: item.productImage ?? null, totalSold: 0, revenue: 0 };
      }
      productStats[item.productId].totalSold += item.quantity;
      productStats[item.productId].revenue += item.price * item.quantity;
    }
  }

  const result = Object.entries(productStats)
    .map(([productId, s]) => ({ productId: Number(productId), ...s }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  res.json(result);
});

router.get("/analytics/customer-growth", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const rows = await db.select({
    month: sql<string>`to_char(${usersTable.createdAt}, 'Mon YYYY')`,
    count: count(),
  }).from(usersTable)
    .where(eq(usersTable.role, "customer"))
    .groupBy(sql`to_char(${usersTable.createdAt}, 'Mon YYYY'), date_trunc('month', ${usersTable.createdAt})`)
    .orderBy(sql`date_trunc('month', ${usersTable.createdAt})`);

  res.json(rows.map(r => ({ month: r.month, count: Number(r.count ?? 0) })));
});

export default router;
