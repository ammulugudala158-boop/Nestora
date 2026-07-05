---
name: Nestora DB Schema
description: Overview of the 11 Drizzle tables for Nestora and key business rules encoded in the schema.
---

## Tables (lib/db/src/schema/)
users, business (singleton), categories, products, orders, offers, loyalty_transactions, reviews, tickets, ticket_replies, notifications, favorites

## Key rules
- `business` table is a singleton — upserted, never inserted twice
- `orders.items` stored as JSONB array of {productId, productName, productImage, quantity, price}
- Loyalty: 1 point earned per ₹100 order total; 1 point = ₹0.50 redemption value
- `users.loyalty_points` updated in-place on order; loyalty_transactions table records each earn/redeem event
- Analytics routes aggregate from orders JSONB items (no separate order_items table)

## How to apply
- When adding new analytics, pull from orders.items JSON via application-level aggregation (see analytics.ts top-products route pattern)
- If adding order_items as a proper table later, migrate existing JSONB data and update analytics routes
