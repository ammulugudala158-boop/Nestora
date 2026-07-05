# Nestora

A full-stack business platform that helps small businesses manage their digital presence. Business owners get a powerful admin dashboard; customers get a polished shopping and service portal.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/nestora run dev` — run the frontend (port 19752, proxied at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — JWT signing secret (mandatory, server fails fast if missing)

## Demo Accounts (password: `password123` for all)

- **Owner:** `owner@nestora.in` / `password123` → redirects to `/admin`
- **Customer:** `priya@example.com` / `password123` → redirects to `/shop`
- **Customer:** `amit@example.com` / `password123` → redirects to `/shop`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Recharts, Wouter routing
- API: Express 5 + JWT (jsonwebtoken) + bcrypt (bcryptjs)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (one file per entity)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/middlewares/authenticate.ts` — JWT middleware + requireOwner guard
- `artifacts/nestora/src/` — React frontend

## Architecture decisions

- JWT stored in localStorage under `nestora_token`; injected into every API call via custom-fetch.ts
- Role-based access: `authenticate` middleware (any auth), `requireOwner` (owner-only guard)
- Orders: customers earn 1 loyalty point per ₹100 spent; 1 point = ₹0.50 redemption value
- Analytics routes aggregate directly from DB (no cached layer) — acceptable for small business scale
- Business table has a single row (singleton pattern); upserted on update

## Product

- **Owner Portal** (`/admin`): Analytics dashboard with revenue charts, product/category/offer CRUD, order status management, customer list, support tickets with replies, business profile editor
- **Customer Portal** (`/shop`): Product catalog with search/filter, cart with coupon and loyalty points, order tracking, favorites, loyalty history, support tickets
- Prices in Indian Rupees (₹)

## User preferences

_Populate as you build._

## Gotchas

- `SESSION_SECRET` must be set — the API server will throw on startup if missing
- After OpenAPI spec changes, run codegen before touching routes or frontend hooks
- DB push uses `push-force` flag if there are column conflicts: `pnpm --filter @workspace/db run push-force`
- Express 5 wildcard routes require named params: `/{*splat}` not `/*`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
