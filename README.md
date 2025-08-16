DeepRabbit App Shell
====================

Full-stack subscription-gated app shell with authentication and placeholders for payments. No code is imported from any external repository.

Stack
-----
- Frontend: Vite + React + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: Prisma + SQLite (dev). You can switch to PostgreSQL by changing `schema.prisma` and `DATABASE_URL`.

Quick start
-----------

1) Backend

```bash
cd server
npm install
copy .env.example .env  # on Windows: copy .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

2) Frontend (new terminal)

```bash
cd client
npm install
npm run dev
```

Configuration
-------------
- Server `.env` keys:
  - `DATABASE_URL` (defaults to `file:./dev.db`)
  - `PORT` (default 4000)
  - `CLIENT_ORIGIN` (default `http://localhost:5173`)
  - `JWT_SECRET` (change in production!)
- Client env:
  - `VITE_API_BASE` (default `http://localhost:4000`)

Features
--------
- User registration/login with hashed passwords
- HttpOnly cookie sessions (JWT)
- Subscription gating with a development activation endpoint
- Payment integration placeholders and webhook route
- Protected route `/app` requires active subscription

Notes
-----
- Replace the placeholder payment code with Stripe or your provider.
- To switch to Postgres, update `schema.prisma` provider and `DATABASE_URL`, then run migrations.



