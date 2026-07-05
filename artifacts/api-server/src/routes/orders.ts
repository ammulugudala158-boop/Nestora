import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, ordersTable, usersTable, productsTable, loyaltyTransactionsTable, notificationsTable } from "@workspace/db";
import { CreateOrderBody, GetOrderParams, UpdateOrderStatusBody, UpdateOrderStatusParams } from "@workspace/api-zod";
import { authenticate, requireOwner, type AuthRequest } from "../middlewares/authenticate";

const router: IRouter = Router();

async function formatOrder(order: typeof ordersTable.$inferSelect) {
  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, order.customerId));
  return {
    ...order,
    customerName: customer?.name ?? "Unknown",
    items: (order.items as any[]) ?? [],
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/orders", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const isOwner = req.userRole === "owner";
  const rows = isOwner
    ? await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt))
    : await db.select().from(ordersTable).where(eq(ordersTable.customerId, req.userId!)).orderBy(desc(ordersTable.createdAt));
  const formatted = await Promise.all(rows.map(formatOrder));
  res.json(formatted);
});

router.post("/orders", authenticate, async (req: AuthRequest, res): Promise<void> => {
  if (req.userRole !== "customer") {
    res.status(403).json({ error: "Only customers can place orders" });
    return;
  }
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { items, couponCode, loyaltyPointsToUse, address, notes } = parsed.data;

  // Calculate total
  const itemsWithDetails: Array<{ productId: number; productName: string; productImage: string | null; quantity: number; price: number }> = [];
  for (const item of items) {
    const [prod] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!prod) {
      res.status(400).json({ error: `Product ${item.productId} not found` });
      return;
    }
    itemsWithDetails.push({
      productId: prod.id,
      productName: prod.name,
      productImage: prod.imageUrl ?? null,
      quantity: item.quantity,
      price: prod.price,
    });
  }

  let subtotal = itemsWithDetails.reduce((s, i) => s + i.price * i.quantity, 0);
  let discount = 0;
  let loyaltyPointsUsed = 0;
  const loyaltyPointsEarned = Math.floor(subtotal / 100); // 1 point per ₹100

  // Handle loyalty points redemption
  if (loyaltyPointsToUse && loyaltyPointsToUse > 0) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    const maxPoints = Math.min(loyaltyPointsToUse, user?.loyaltyPoints ?? 0);
    const pointDiscount = maxPoints * 0.5; // 1 point = ₹0.5
    discount += pointDiscount;
    loyaltyPointsUsed = maxPoints;
  }

  const total = Math.max(0, subtotal - discount);

  const [order] = await db.insert(ordersTable).values({
    customerId: req.userId!,
    status: "pending",
    total,
    discount: discount || null,
    couponCode: couponCode ?? null,
    loyaltyPointsUsed: loyaltyPointsUsed || null,
    loyaltyPointsEarned,
    address: address ?? null,
    notes: notes ?? null,
    items: itemsWithDetails as any,
  }).returning();

  // Update user loyalty points
  if (loyaltyPointsUsed > 0 || loyaltyPointsEarned > 0) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    const newPoints = (user?.loyaltyPoints ?? 0) - loyaltyPointsUsed + loyaltyPointsEarned;
    await db.update(usersTable).set({ loyaltyPoints: newPoints }).where(eq(usersTable.id, req.userId!));

    if (loyaltyPointsEarned > 0) {
      await db.insert(loyaltyTransactionsTable).values({
        userId: req.userId!,
        points: loyaltyPointsEarned,
        type: "earned",
        description: `Earned for order #${order.id}`,
      });
    }
    if (loyaltyPointsUsed > 0) {
      await db.insert(loyaltyTransactionsTable).values({
        userId: req.userId!,
        points: loyaltyPointsUsed,
        type: "redeemed",
        description: `Redeemed for order #${order.id}`,
      });
    }
  }

  // Notify user
  await db.insert(notificationsTable).values({
    userId: req.userId!,
    title: "Order Placed",
    message: `Your order #${order.id} has been placed successfully.`,
    type: "order",
  });

  res.status(201).json(await formatOrder(order));
});

router.get("/orders/:id", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (req.userRole !== "owner" && order.customerId !== req.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  res.json(await formatOrder(order));
});

router.patch("/orders/:id", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [order] = await db.update(ordersTable).set({ status: parsed.data.status }).where(eq(ordersTable.id, params.data.id)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  // Notify customer
  await db.insert(notificationsTable).values({
    userId: order.customerId,
    title: "Order Updated",
    message: `Your order #${order.id} status is now: ${parsed.data.status}.`,
    type: "order",
  });

  res.json(await formatOrder(order));
});

export default router;
