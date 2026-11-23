# PizzaHub 🍕

PizzaHub is a full-stack pizza marketplace. Customers browse admin-approved pizzas from local kitchens and place orders; vendors manage their menu, orders, and Premium upgrade; admins moderate items, users, and payments. The project is split into two repositories: a **Next.js 16 client** and an **Express 5 + MongoDB API**.

| | |
|---|---|
| **Live website** | _Not deployed yet — replace this line with the Vercel URL after deployment._ |
| **Client repo** | https://github.com/rahatlab/pizzahub-client |
| **Server repo** | https://github.com/rahatlab/pizzahub-server |

## Key features

- **Public menu** — home page with 3D pizza hero, featured items (premium vendors first), six categories, and a browse page with debounced search, category/location filters, price sorting and pagination.
- **Authentication** — email/password and Google sign-in through Better Auth, issuing JWTs that the API verifies against a remote JWKS. Blocked accounts are rejected on every request.
- **Role-based dashboards** — separate customer, vendor and admin workspaces with role guards on both the client and the API.
- **Vendor menu management** — create/edit/delete items with up to 5 images (ImgBB upload, 3 MB each), submit for review, toggle availability. Free plan is capped at 3 counted items; rejected items can be edited and resubmitted.
- **Ordering** — order dialog with delivery date/address, one-pending-order-per-item guard, atomic vendor accept/reject, customer cancel while pending, and a status timeline.
- **Admin moderation** — approve/reject menu items with a reason, block/unblock users, review users and the read-only transactions ledger, and remove Premium (with Free-plan overflow trimming).
- **Premium upgrade** — one-time Stripe Checkout payment ($99.99, lifetime) with activation only from the verified Stripe webhook; the success page never activates a plan. Transaction records are idempotent.
- **Dashboards & charts** — Recharts order-status and category breakdowns, stat cards, skeleton loading states, and empty states with illustrations.
- **UX polish** — responsive layouts, dark/light theme, toast notifications for actions, custom 404 with a pizza illustration, and reduced-motion-aware Framer Motion reveals.

## Tech stack

### Client (`pizzahub-client`)

| Package | Purpose |
|---|---|
| `next` 16.4.6, `react` 19.3, `react-dom` 19.3 | App Router frontend, server components, route handlers |
| `typescript` 5 | Type safety |
| `tailwindcss` 4.3.3, `@tailwindcss/turbopack` | Styling and design tokens |
| `better-auth` 1.7.27, `@better-auth/mongo-adapter` | Email/password + Google auth, JWT plugin |
| `mongodb` 7.9.1 | Better Auth's Mongo adapter connection |
| `@tanstack/react-query` 5 | QueryClient provider available for client-side fetching |
| `framer-motion` 14 | Hero and scroll-reveal animations |
| `three` 0.180, `@types/three` | 3D pizza hero scene |
| `recharts` 3.11 | Dashboard charts |
| `sonner` 2 | Toast notifications |
| `react-hook-form` 7, `zod` 4, `@hookform/resolvers` | Form state and validation |
| `@hugeicons/react`, `@hugeicons/core-free-icons` | Icon system |
| `next-themes` 0.4 | Dark/light theme |
| `class-variance-authority`, `cn`, `shadcn`, `@base-ui/react` | UI primitives and variants |
| `date-fns` 4 | Date formatting |
| `eslint` 9, `eslint-config-next` 16 | Linting |

### Server (`pizzahub-server`)

| Package | Purpose |
|---|---|
| `express` 5.1 | HTTP API |
| `mongoose` 9.1 | MongoDB models and queries |
| `jose` 6.2 | JWKS verification of Better Auth JWTs |
| `stripe` 20.1 | Checkout session + webhook handling |
| `multer` 2.0 | In-memory image upload parsing |
| `zod` 4.6 | Request validation |
| `helmet` 8.1, `cors` 2.8, `express-rate-limit` 8.2 | Security headers, CORS allowlist, rate limiting |
| `dotenv` 17 | Environment loading |
| `tsx` 4.20, `typescript` 5.9 | TypeScript runtime and type checking |

## Installation

Prerequisites: **Node.js 22+**, npm, a MongoDB database (Atlas or local), a Stripe account in test mode, and an ImgBB API key.

```bash
# 1. Clone both repositories side by side
git clone https://github.com/rahatlab/pizzahub-client.git
git clone https://github.com/rahatlab/pizzahub-server.git

# 2. Install dependencies
cd pizzahub-client && npm install
cd ../pizzahub-server && npm install
```

## Run locally

### 1. Environment variables

Copy the example files and fill in your own values. **Values are intentionally not committed.**

```bash
cd pizzahub-server && cp .env.example .env
cd ../pizzahub-client && cp .env.example .env.local
```

Client (`pizzahub-client/.env.local`):

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_APP_URL` | Public app origin, e.g. `http://localhost:3000` |
| `BETTER_AUTH_URL` | Better Auth base URL and JWT issuer/audience |
| `BETTER_AUTH_SECRET` | Better Auth signing secret |
| `MONGODB_URI` | Mongo connection string (Better Auth adapter) |
| `MONGODB_DB` | Database name |
| `GOOGLE_CLIENT_ID` | Google OAuth client id |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side checkout) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Price used for the lifetime Premium plan |
| `PUBLISH_KEY` | Stripe publishable key |
| `IMGBB_API_KEY` | Image host key used by the upload proxy |

Server (`pizzahub-server/.env`):

| Variable | Used for |
|---|---|
| `PORT` | API port (default `5000`) |
| `NODE_ENV` | `development` / `production` |
| `MONGODB_URI` | Mongo connection string |
| `MONGODB_DB` | Database name |
| `BETTER_AUTH_URL` | JWKS/issuer/audience of the auth server |
| `CLIENT_URL` | Client origin allowed by CORS |
| `ALLOWED_ORIGINS` | Extra comma-separated allowed origins |
| `STRIPE_SECRET_KEY` | Stripe secret key for checkout + webhook |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `IMGBB_API_KEY` | Image upload key |

### 2. Prepare the database

```bash
cd pizzahub-server
npm run db:indexes     # create Mongo indexes
npm run seed:admin -- you@example.com   # promote an existing account (sign up first)
npm run seed:demo      # optional: demo vendors and menu items
```

### 3. Start both apps

```bash
# Terminal 1 — API on http://localhost:5000
cd pizzahub-server && npm run dev

# Terminal 2 — client on http://localhost:3000
cd pizzahub-client && npm run dev
```

### 4. Stripe webhook (local)

Premium is activated **only** by the webhook, so forward events while testing:

```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```

Use Stripe test card `4242 4242 4242 4242` with any future expiry date, then finish the Checkout flow and return to `/payment/success`.

### Useful scripts

| Repo | Command | What it does |
|---|---|---|
| client | `npm run dev` | Next.js dev server |
| client | `npm run build` / `npm start` | Production build / serve |
| client | `npx eslint src` | Lint |
| client | `npx tsc --noEmit` | Type-check |
| server | `npm run dev` | API with `tsx watch` |
| server | `npm run build` | Type-check (`tsc --noEmit`) |
| server | `npm run db:indexes` | Create indexes |
| server | `npm run seed:admin` / `seed:demo` | Seed admin / demo data |

## Challenge implementation notes

### 1. Advanced search API query params

`GET /api/menu` is public and returns **approved items only**. Every filter is validated with Zod before the query runs.

| Param | Type / allowed values | Behaviour |
|---|---|---|
| `search` | string, ≤ 120 chars | Case-insensitive regex on `itemName` **or** `description`; regex metacharacters are escaped |
| `category` | one of the six categories (`Pizza`, `Sides`, `Drinks`, …) | Exact category match |
| `location` | string, ≤ 120 chars | Case-insensitive exact location match |
| `sort` | `newest` (default), `price_asc`, `price_desc` | `createdAt` descending or `price` ascending/descending |
| `page` | positive integer (default `1`) | 1-based page number |
| `limit` | positive integer (default `12`, capped at `50`) | Page size |

```bash
curl "http://localhost:5000/api/menu?search=cheese&category=Pizza&location=Dhaka&sort=price_asc&page=1&limit=12"
```

The response contains `data` plus `meta.pagination` (`page`, `limit`, `total`, `totalPages`, `hasNext`), which drives the "Page X of Y" controls. The client keeps filters in the URL query string so a filtered menu is shareable, and it debounces typing by 250 ms before requesting.

Related public endpoints: `GET /api/menu/featured` (up to 8 approved items, active premium vendors first, then newest) and `GET /api/menu/filters` (category and location counts, all six categories returned even at zero).

### 2. JWT middleware flow

1. **Sign-in** — the client calls Better Auth (`/api/auth/*` route handler) with email/password or Google. Better Auth stores the session in MongoDB and its JWT plugin exposes signing keys at `BETTER_AUTH_URL/api/auth/jwks`.
2. **Token attachment** — client requests send `Authorization: Bearer <jwt>` through the shared `apiFetch` helper.
3. **`verifyJWT` middleware** (Express):
   - rejects a missing/empty Bearer header → `401`;
   - verifies signature, `issuer` and `audience` with `jose` against a module-scoped remote JWKS (`cooldownDuration: 30s`, `cacheMaxAge: 1h`) so cold starts do not refetch keys per request;
   - maps expired tokens to `401 "Your session expired"` and other failures to `INVALID_TOKEN`;
   - loads the user by JWT `sub` from MongoDB and rejects deleted (`401`) or blocked (`403 ACCOUNT_BLOCKED`) accounts;
   - syncs premium expiry/plan from the database (not from the token), then attaches `req.user` with id, role, plan and profile fields.
4. **Authorisation** — `requireRole("vendor" | "admin" | "customer")` guards role-specific routes, and `assertOwner`/explicit checks stop vendors from editing another kitchen's items or orders.
5. **Errors** — every failure is an `ApiError`; the shared error handler returns `{ success: false, message, code }` with the correct status, while `asyncHandler` forwards rejected promises.

Because role and `isBlocked` are read from MongoDB on each request, an admin block or Premium revoke takes effect immediately — no stale JWT claims.

### 3. UI improvements made (Challenge 3)

- **Heading hierarchy** — each page has exactly one `<h1>` (hero, browse menu, item detail, dashboard header, auth cards, 404); section titles are `<h2>` and card titles `<h3>`.
- **Equal-height cards** — card grids use `grid` + `items-stretch`, and cards are `h-full` with the price row pushed down via `mt-auto`, so rows line up regardless of description length.
- **Uniform image ratios** — menu card images, the item detail hero and image thumbnails all use fixed ratios (`aspect-video` / `aspect-square`), and skeletons mirror the same ratios to avoid layout shift.
- **Loading skeletons** — `loading.tsx` files cover the browse menu (filters + 8 card placeholders) and every dashboard route (header, stats, charts, table rows), while client-fetched lists (menu, orders, users, transactions, vendor items) render skeleton rows during fetch.
- **Toasts for every action** — Sonner toasts report sign-in/up, item submit/update/delete/availability, order accept/reject/cancel, premium checkout errors/activation, profile changes, uploads and admin actions, including server error messages.
- **Custom 404** — a dedicated page with the PizzaHub logo, an inline SVG pizza illustration, and "Browse menu" / "Back to home" actions, plus styled `error.tsx` and `global-error.tsx`.
- **Empty states with illustrations** — a shared `EmptyState` (pizza illustration + title + description + optional action) is used for empty menus, orders, transactions, dashboard data, and no-search-results, with a "Reset filters" action where relevant.
- **Smooth Framer Motion transitions** — the hero staggers the headline and floats the 3D pizza; a `Reveal` wrapper fades/staggers featured cards, categories, benefit cards and menu results into view. All motion is disabled or reduced via `useReducedMotion`.
- **Theme + responsiveness** — `next-themes` dark/light toggle, mobile dashboard sheet navigation, and fluid layouts from a single-column phone breakpoint up to a 1240 px desktop container.

## Project structure (client)

```
src/
├─ app/
│  ├─ (site)/            # public home, /menu, /menu/[id]
│  ├─ (auth)/            # sign-in, sign-up
│  ├─ (protected)/       # dashboards, payment success/cancel, profile settings
│  └─ not-found.tsx      # custom 404
├─ components/           # home, menu, dashboard, forms, shared, ui
└─ lib/                  # auth, api client, session, constants, validators
```

The API follows `routes → middleware (connectDb, verifyJWT, requireRole, validate) → models`, with `utils` for pagination, serialization, subscriptions and errors.
