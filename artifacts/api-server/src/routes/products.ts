import { Router, type IRouter } from "express";
import { eq, and, ilike, avg, count, sql } from "drizzle-orm";
import { db, productsTable, categoriesTable, reviewsTable, favoritesTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  CreateProductBody,
  UpdateProductBody,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
  AddFavoriteParams,
  RemoveFavoriteParams,
} from "@workspace/api-zod";
import { authenticate, requireOwner, type AuthRequest } from "../middlewares/authenticate";

const router: IRouter = Router();

async function enrichProduct(p: typeof productsTable.$inferSelect) {
  const cat = p.categoryId ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, p.categoryId)).then(r => r[0]) : null;
  const reviewStats = await db.select({ avg: avg(reviewsTable.rating), cnt: count() }).from(reviewsTable).where(eq(reviewsTable.productId, p.id));
  return {
    ...p,
    images: p.images ?? [],
    categoryName: cat?.name ?? null,
    rating: reviewStats[0]?.avg ? parseFloat(reviewStats[0].avg as string) : null,
    reviewCount: Number(reviewStats[0]?.cnt ?? 0),
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const params = ListProductsQueryParams.safeParse(req.query);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const conditions = [];
  if (params.success) {
    if (params.data.categoryId) conditions.push(eq(productsTable.categoryId, params.data.categoryId));
    if (params.data.search) conditions.push(ilike(productsTable.name, `%${params.data.search}%`));
    if (params.data.featured !== undefined) conditions.push(eq(productsTable.isFeatured, params.data.featured));
  }
  const prods = conditions.length
    ? await db.select().from(productsTable).where(and(...conditions)).orderBy(productsTable.createdAt)
    : await db.select().from(productsTable).orderBy(productsTable.createdAt);

  const enriched = await Promise.all(prods.map(enrichProduct));
  res.json(enriched);
});

router.post("/products", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [prod] = await db.insert(productsTable).values({
    ...parsed.data,
    images: parsed.data.images ?? [],
    isFeatured: parsed.data.isFeatured ?? false,
  }).returning();
  res.status(201).json(await enrichProduct(prod));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [prod] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!prod) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(await enrichProduct(prod));
});

router.patch("/products/:id", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [prod] = await db.update(productsTable).set(parsed.data).where(eq(productsTable.id, params.data.id)).returning();
  if (!prod) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(await enrichProduct(prod));
});

router.delete("/products/:id", authenticate, requireOwner, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
  res.sendStatus(204);
});

// Favorites
router.get("/favorites", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const favs = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, req.userId!));
  const prods = await Promise.all(favs.map(async f => {
    const [p] = await db.select().from(productsTable).where(eq(productsTable.id, f.productId));
    return p ? enrichProduct(p) : null;
  }));
  res.json(prods.filter(Boolean));
});

router.post("/favorites/:productId", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const params = AddFavoriteParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const existing = await db.select().from(favoritesTable).where(
    and(eq(favoritesTable.userId, req.userId!), eq(favoritesTable.productId, params.data.productId))
  );
  if (!existing.length) {
    await db.insert(favoritesTable).values({ userId: req.userId!, productId: params.data.productId });
  }
  res.status(201).json({ success: true });
});

router.delete("/favorites/:productId", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const params = RemoveFavoriteParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(favoritesTable).where(
    and(eq(favoritesTable.userId, req.userId!), eq(favoritesTable.productId, params.data.productId))
  );
  res.sendStatus(204);
});

export default router;
