# Flinkit

Marketplace + delivery — sellers, customers, agents, tracking.

**Started:** 28-05-2026

## Repo layout

```
flink-it/
├── apps/web/     # React frontend
├── apps/api/     # Node API → MongoDB Atlas
└── docker/       # optional later
```

## Stack

| | Frontend (`apps/web`) | Backend (`apps/api`) |
|---|------------------------|----------------------|
| Core | React, TypeScript, **Vite** | Node 20+, TypeScript, **Fastify** |
| Forms / validation | **RHF** + **Zod** | **Zod** |
| Data | **TanStack Query** | **Mongoose** → **MongoDB** |
| UI | **Tailwind** + **shadcn/ui** | — |
| Routing | **React Router** | — |
| Auth | — | **JWT** + **bcrypt** |

**Phase 2 (later):** Redis, Kafka, `apps/worker`, WebSocket / live map.

## Roles

| Role | Who | Does |
|------|-----|------|
| `CUSTOMER` | Buyer | Place orders, track delivery |
| `SELLER` | Merchant | List products, confirm / prepare orders |
| `AGENT` | Delivery | Accept assign, pickup → drop, share live location |
| `SUPERADMIN` | Ops | List all users / manage system — seed only, not public register |

Public register: `CUSTOMER` \| `SELLER` \| `AGENT` only.  
`GET /auth/users` → **SUPERADMIN** only (`GET /admin/users`). Admin portal (`apps/admin`) later.

## Location

| Who | What we store |
|-----|----------------|
| **Seller** | Shop / pickup address (on profile or order) |
| **Customer** | Drop address (on order) |
| **Agent** | Live lat/lng + online status (frequent updates) |

MVP: addresses on order + agent last location. Live map / WebSocket → Phase 2.

## Architecture

```
apps/web  →  apps/api  →  MongoDB Atlas
```

**Frontend:** API data → TanStack Query · Forms → RHF + Zod  
**Backend:** `routes` → `controllers` → `services` → `models` · assign via atomic `findOneAndUpdate`

## MongoDB (MVP)

| Collection | Purpose |
|------------|---------|
| `users` | auth, role: `CUSTOMER` \| `SELLER` \| `AGENT` \| `SUPERADMIN` |
| `sellerprofiles` | shop name, pickup address, isOpen |
| `products` | seller catalog (name, price, availability) |
| `orders` | seller, customer, agent, items, pickup/drop, status |
| `orderstatushistories` | audit trail |

**Order status:** `PENDING` → `CONFIRMED` → `ASSIGNED` → `PICKED_UP` → `DELIVERED` (or `CANCELLED`)

## API (MVP)

**Auth:** `POST /auth/register` · `POST /auth/login` · `GET /auth/me`  
**Admin:** `GET /admin/users` · `GET /admin/users/:id` (SUPERADMIN)  
**Orders (Blinkit-style):**  
Customer `POST /orders` → Shop `POST /orders/:id/confirm` → Agents see `GET /orders/available` → Agent `POST /orders/:id/accept` → `PATCH .../status` pickup/deliver

Also: `GET /orders` · `GET /orders/:id` · cancel via `PATCH .../status`

## Env

| Variable | Where |
|----------|--------|
| `VITE_API_URL` | web — `http://localhost:4000` |
| `MONGODB_URI` | api — Atlas `mongodb+srv://...` (password: encode `@` → `%40`) |
| `PORT` | api — `4000` |
| `JWT_ACCESS_SECRET` | api |
| `CORS_ORIGIN` | api — `http://localhost:5173` |

## Local dev

```bash
cd apps/api && npm install && npm run seed:demo && npm run dev   # :4000
cd apps/web && npm install && npm run dev                       # :5173
```

### Demo logins (password `Demo@12345`)

| Email | Role | What to do |
|-------|------|------------|
| `customer@flinkit.demo` | Customer | Open **Fresh Mart Baner**, add items, checkout |
| `seller@flinkit.demo` | Seller | Accept **PENDING** order |
| `agent@flinkit.demo` | Agent | Available jobs auto-refresh (CONFIRMED) → accept → deliver |
| `admin@flinkit.com` | Superadmin | `/admin` |

Seed also creates shop + 5 products + 1 PENDING + 1 CONFIRMED sample order.

### E2E flow

1. Customer → browse shop → cart → place order  
2. Seller → pending list (polls 5s) → Accept  
3. Agent → “Available jobs” (polls 5s, toast on new) → Accept delivery → Picked up → Delivered  

**Web:** Vite + React + TanStack Query + RHF + Zod + Tailwind  
**Notification (MVP):** agent polls `/orders/available` — push/Kafka later.