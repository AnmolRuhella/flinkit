# Flinkit

Delivery agent system — orders, agents, tracking.

**Started:** 28-05-2026

## Repo layout

```
flink-it/
├── apps/web/     # React frontend
├── apps/api/     # Node API → MongoDB
└── docker/       # MongoDB (local)
```

## Stack

| | Frontend (`apps/web`) | Backend (`apps/api`) |
|---|------------------------|----------------------|
| Core | React, TypeScript, **Vite** | Node 20+, TypeScript, **Fastify** |
| Forms / validation | **RHF** + **Zod** | **Zod** |
| Data | **TanStack Query** (API + server state) | **Mongoose** → **MongoDB** |
| UI | **Tailwind** + **shadcn/ui** | — |
| Routing | **React Router** | — |
| Auth | — | **JWT** + **bcrypt** |

**Phase 2 (later):** Redis, Kafka, `apps/worker`, WebSocket.

## Architecture

```
apps/web  →  apps/api  →  MongoDB
```

**Frontend rules**

- API data → TanStack Query (`useQuery` / `useMutation`)
- Forms → RHF + Zod
- UI-only state → local state (Zustand if needed later)

**Backend rules**

- `routes` → `controllers` → `services` → `models`
- Assign / status change → atomic `findOneAndUpdate` (e.g. only when `status: PENDING`)

## MongoDB (MVP)

| Collection | Purpose |
|------------|---------|
| `users` | auth, role: `CUSTOMER` \| `AGENT` \| `ADMIN` |
| `agent_profiles` | online, location |
| `orders` | pickup/drop, status, assigned agent |
| `order_status_histories` | audit trail |

**Order status:** `PENDING` → `CONFIRMED` → `ASSIGNED` → `PICKED_UP` → `DELIVERED` (or `CANCELLED`)

## API (MVP)

`POST /auth/register` · `POST /auth/login` · `GET|POST /orders` · `GET /orders/:id` · `PATCH /orders/:id/status` · `GET /agents` · `PATCH /agents/me/status` · `PATCH /agents/me/location` · `GET /health`

## Env

| Variable | Where |
|----------|--------|
| `VITE_API_URL` | web — e.g. `http://localhost:3000` |
| `MONGODB_URI` | api — `mongodb://localhost:27017/flinkit` |
| `PORT` | api — `3000` |
| `JWT_ACCESS_SECRET` | api |
| `CORS_ORIGIN` | api — `http://localhost:5173` |

## Local dev (when scaffolded)

```bash
cd docker && docker compose up -d    # MongoDB :27017
# apps/api → npm run dev
# apps/web → npm run dev
```

---

_Details change over time — update this file when stack shifts._
