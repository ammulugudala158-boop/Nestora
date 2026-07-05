---
name: Nestora JWT Auth Pattern
description: Auth architecture for Nestora — JWT signing, token storage, middleware chain, and the mandatory SESSION_SECRET rule.
---

## Rule
`SESSION_SECRET` env var must be set. `artifacts/api-server/src/lib/auth.ts` throws at startup if missing — no hardcoded fallback.

**Why:** A predictable fallback secret allows token forgery and full auth bypass.

## Token flow
- JWT signed with `SESSION_SECRET`, expires 30d
- Stored in localStorage key `nestora_token`
- Injected on every API request via `lib/api-client-react/src/custom-fetch.ts` (Authorization: Bearer header)
- `authenticate` middleware in `artifacts/api-server/src/middlewares/authenticate.ts` verifies token and attaches `req.userId` + `req.userRole`
- `requireOwner` guard added after `authenticate` for owner-only routes

## How to apply
- Always chain `authenticate` then `requireOwner` for admin endpoints
- POST /orders is `authenticate` only (customer-only enforced with explicit role check inside handler)
- Customers cannot access `/admin/*` routes (frontend redirect) and owner-only API routes return 403
