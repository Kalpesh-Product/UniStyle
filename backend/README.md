# Uni Style — Backend API

Node.js + Express + PostgreSQL (via Prisma ORM) backend for the Uni Style storefront.
Pairs with the existing React/Vite frontend (which currently has its cart/wishlist/auth as
in-browser Context state only — this backend gives it real persistence + payments).

## Stack

- **Express** — HTTP server / routing
- **PostgreSQL** + **Prisma** — database + ORM (schema in `prisma/schema.prisma`)
- **JWT** (`jsonwebtoken`) — stateless auth, sent as `Authorization: Bearer <token>`
- **bcryptjs** — password hashing
- **Stripe** — real checkout/payments
- **zod** — request validation
- **helmet**, **cors**, **express-rate-limit** — baseline security

## Setup

1. **Install Postgres** (locally, via Docker, or a hosted service like Railway/Supabase/Neon).

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Then fill in:
   - `DATABASE_URL` — your Postgres connection string
   - `JWT_SECRET` — any long random string (`openssl rand -hex 32`)
   - `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — from your Stripe dashboard (use test keys
     while developing: https://dashboard.stripe.com/test/apikeys)
   - `CLIENT_URL` — where the frontend runs (e.g. `http://localhost:5173`)

4. **Create the database tables**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed example products** (mirrors what's already hardcoded in the frontend)
   ```bash
   npm run seed
   ```

6. **Run the server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:4000` by default. Health check: `GET /health`.

## Stripe webhook (local testing)

Stripe needs to call your webhook to confirm payment — locally, use the Stripe CLI to forward
events:
```bash
stripe listen --forward-to localhost:4000/api/checkout/webhook
```
This prints a `whsec_...` value — put that in `.env` as `STRIPE_WEBHOOK_SECRET`.

## API Reference

All authenticated routes expect `Authorization: Bearer <token>` (token returned from
signup/login).

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | `{ email, password, firstName?, lastName? }` |
| POST | `/api/auth/login` | — | `{ email, password }` |
| GET | `/api/auth/me` | ✅ | Returns current user |

### Products
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | — | Query params: `category`, `search`, `featured`, `page`, `limit` |
| GET | `/api/products/:slug` | — | Single product (matches frontend's `/product/:slug` route) |

### Cart
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | ✅ | List items in the user's cart |
| POST | `/api/cart` | ✅ | `{ productId, quantity, size?, color? }` |
| PATCH | `/api/cart/:itemId` | ✅ | `{ quantity }` |
| DELETE | `/api/cart/:itemId` | ✅ | Remove one item |
| DELETE | `/api/cart` | ✅ | Clear cart |

### Wishlist
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/wishlist` | ✅ | List wishlist items |
| POST | `/api/wishlist` | ✅ | `{ productId }` |
| DELETE | `/api/wishlist/:productId` | ✅ | Remove from wishlist |

### Checkout (Stripe)
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/checkout/create-session` | ✅ | `{ shippingAddress }` — creates a PENDING order + Stripe Checkout session, returns `{ url }` to redirect the user to |
| POST | `/api/checkout/webhook` | (Stripe only) | Stripe calls this on payment completion; marks order `PAID` and clears the cart |

### Orders
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/orders` | ✅ | Order history for the logged-in user |
| GET | `/api/orders/:id` | ✅ | Single order detail |

## Frontend integration notes

The frontend's `CartContext`, `WishlistContext`, and `AuthContext` currently manage state purely
in the browser. To connect this backend, those contexts need to be updated to:

1. Call `/api/auth/login` / `/api/auth/signup` and store the returned JWT (e.g. in memory + a
   secure storage mechanism — avoid plain `localStorage` for production-grade security if
   possible, or accept the tradeoff for an MVP).
2. Attach `Authorization: Bearer <token>` to all cart/wishlist/checkout/order requests.
3. Replace `src/data/products.ts` static reads with calls to `GET /api/products` and
   `GET /api/products/:slug`.
4. On the Checkout page, call `POST /api/checkout/create-session` and redirect
   `window.location.href = data.url` to send the user to Stripe's hosted checkout page.

This is a frontend code change, not something this backend needs — flagging it so your team
knows the wiring step is still required.

## Production checklist

- [ ] Use a managed Postgres instance (not local) — e.g. Supabase, Neon, RDS, Railway
- [ ] Set `STRIPE_SECRET_KEY` to a **live** key only when ready to accept real payments
- [ ] Set strong, unique `JWT_SECRET`
- [ ] Put this behind HTTPS (Stripe requires it for live mode)
- [ ] Consider adding refresh tokens if sessions need to last longer than the JWT expiry
- [ ] Add structured logging / error monitoring (e.g. Sentry) before going live
