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
| `ADMIN` | Ops (optional) | Manage users / disputes — later |

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
| `users` | auth, role: `CUSTOMER` \| `SELLER` \| `AGENT` \| `ADMIN` |
| `seller_profiles` | shop name, pickup address |
| `agent_profiles` | isOnline, lastLat/lng |
| `orders` | seller, customer, agent, pickup/drop, status |
| `order_status_histories` | audit trail |

**Order status:** `PENDING` → `CONFIRMED` → `ASSIGNED` → `PICKED_UP` → `DELIVERED` (or `CANCELLED`)

## API (MVP)

`POST /auth/register` · `POST /auth/login` · `GET|POST /orders` · `GET /orders/:id` · `PATCH /orders/:id/status` · `GET /agents` · `PATCH /agents/me/status` · `PATCH /agents/me/location` · `GET /health`

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
cd apps/api && cp .env.example .env && npm install && npm run dev
curl http://localhost:4000/health

# Register (role: CUSTOMER | SELLER | AGENT)
curl -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Anmol","email":"anmol@test.com","password":"password123","role":"CUSTOMER"}'
```
