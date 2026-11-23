# 🍕 PizzaHub — Full-Stack Project Plan v2.1

> **Assignment 9 — PizzaHub: Pizza Ordering & Delivery Platform**
>
> Implementation-ready blueprint: architecture, Vercel deployment, design system, schema, API, business rules, phases, QA, and delivery checklist.
>
> **Status:** Phase 0 complete (repo cleanup + design reference moved). Phase 1 client foundation complete (design tokens/fonts, shadcn, Better Auth config, JWT plugin, auth pages, proxy/guards, role placeholders). Next: Phase 2 server foundation, then wire the client JWT to the Express `/api/health` and `/api/users/me`.
>
> **Backend target:** Express 5 on **Vercel** (separate Vercel project from the Next.js client).

---

## 0. Verdict & What Changed

### 0.1 Verdict

Plan v1 was a good feature map, but not implementation-ready. Requirement coverage was roughly 75%. The main problems were:

- **Design mismatch:** v1 proposed a cream/red theme with glassmorphism and a Three.js 3D pizza. The references are near-black + orange, flat surfaces, bold 3-line hero, and a bento dashboard.
- **Stack mismatch:** v1 said Next.js 14 + `tailwind.config.ts`; the actual project is Next.js 16.4.6 + React 19.3 + Tailwind v4 + shadcn `base-maia` + Base UI + hugeicons + npm.
- **Auth architecture unclear:** where Better Auth runs, how JWT is issued/verified, and how SSR guards work were not defined.
- **Premium/order/admin gaps:** featured placement, premium badge, subscription cancellation/expiry, private item details, admin delete/status/user detail, vendor profile, password rules, and blocked-user enforcement were missing.
- **Deployment:** v1 said Render/Railway; the requirement is **Express 5 on Vercel**.

**v2.1 decision:** keep the correct direction, fix the details, and implement the blueprint below.

### 0.2 What changed from v1

| Area | v1 | v2.1 |
|---|---|---|
| Design | Cream/red + glass + 3D | Dark near-black + orange + cream; flat; bold type |
| Hero | Three.js 3D pizza | Typographic hero + pizza image + Framer Motion |
| Stack | Next 14, `tailwind.config.ts` | Next 16.4.6, Tailwind v4 `@theme`, shadcn base-maia |
| Auth | Custom `/api/auth/*`, unclear JWT | Better Auth in Next + JWT plugin + Express JWKS verify |
| Backend deploy | Render/Railway | Express 5 on Vercel (zero-config) |
| Menu status | `status` + `isActive` | `status` only: pending/approved/rejected/inactive |
| Item details | Public | Private; logged-out → sign-in |
| Premium | Basic plan | Featured, badge, one-time purchase, lifetime access |
| Orders | Basic CRUD | Vendor/admin restrictions, duplicate guard, atomic states |
| API standard | Generic examples | PizzaHub examples + Better Auth/Stripe exceptions |
| QA/deploy | Thin | QA matrix, seed scripts, env tables, commit budget |

---

## 1. Goal, Scope, Success Criteria

**Goal:** Cover 100% of Assignment 9 with a professional, reference-matched UI and a deployable full-stack app: Next.js client on Vercel + Express 5 API on Vercel + MongoDB Atlas + Better Auth + Stripe + ImgBB.

**Approval scope:** Implementation proceeds in phases. The static design reference lives at `docs/design-reference/`; production UI is built directly in `src/`.

**Success criteria (all `[ ]` until done):**

- [ ] All mandatory pages, APIs, and business rules implemented
- [ ] 20+ meaningful client commits and 12+ meaningful server commits
- [ ] Separate client/server GitHub repos
- [ ] Admin can block/unblock users; blocked users are blocked server-side
- [ ] Premium activates only from a verified Stripe webhook
- [ ] Advanced menu search + price asc/desc + category/location filter
- [ ] JWT middleware rejects invalid/expired tokens
- [ ] Client and Express API both live on Vercel
- [ ] No CORS/404/504 on live; private route reload does not log out
- [ ] Responsive at 375/768/1280; dark/light works
- [ ] README complete; admin credentials + live links submitted

---

## 2. What v1 Got Right

- Role model (Customer/Vendor/Admin) and all three dashboards identified.
- Four core collections identified.
- Stripe webhook-only activation principle correct.
- Challenges and optional features identified.
- Phase structure and security checklist were a useful base.
- API response standard idea is good; examples needed rewriting.

---

## 3. P0 Corrections (v1 → v2.1)

| # | v1 problem | v2.1 decision |
|---|---|---|
| 1 | Cream/red + glassmorphism + 3D pizza does not match references | Dark-first near-black + orange + cream text; flat surfaces; bold typography; light theme is cream. Glassmorphism only as subtle navbar blur. |
| 2 | Three.js 3D hero | **Remove.** Assignment requires Motion and warns against unnecessary animation. Use Framer Motion entrance/stagger + CSS glow/pattern. |
| 3 | Next 14, `tailwind.config.ts`, Radix assumptions | Next 16.4.6, Tailwind v4 CSS-first `@theme`, shadcn `base-maia`/Base UI/hugeicons, `src/` layout, `proxy.ts`, async `params`. |
| 4 | Custom `/api/auth/*`; Better Auth placement unclear | Better Auth runs **inside Next.js** at `/api/auth/[...all]`; Express is a JWT-protected resource API. |
| 5 | JWT flow undefined | Better Auth JWT plugin issues 15m JWT; Express verifies via remote JWKS + `jose`, then loads user from Mongo for role/blocked/plan. |
| 6 | `users` collection + ObjectId refs undefined | Better Auth `user.modelName: 'users'`; Mongo adapter ObjectId `_id`; Mongoose `User` reads the same collection with `autoIndex: false`. |
| 7 | `isActive` boolean + `status: inactive` duplicate | **Drop `isActive`.** Status is the single source of truth: `pending / approved / rejected / inactive`. Public = approved only. |
| 8 | Premium incomplete | Featured query (premium first), Premium badge, Stripe customer id, cancel-at-period-end, expiry sync, downgrade deactivation policy. |
| 9 | Order rules incomplete | Vendor cannot order own item; admin cannot order; vendor can order other vendors' items; duplicate active order blocked; atomic pending-only transitions; UTC date normalization. |
| 10 | `/menu/[id]` listed public | Item details is **private**: logged-out → sign-in with redirect; vendors/admins cannot order. |
| 11 | Password rules absent | Min 6, max 128, at least one uppercase + one lowercase; enforced client + Better Auth hook. |
| 12 | Blocked users mentioned but no mechanism | Express loads user on every JWT request and returns 403 `ACCOUNT_BLOCKED`; Next layout redirects to `/blocked`; admin block sets vendor items inactive. |
| 13 | Navbar/footer vague | Exact public/logged-in nav, profile dropdown, immediate auth update, theme toggle, mobile sheet; footer contact/social/X logo/copyright. |
| 14 | Admin/vendor gaps | Admin user detail, admin item delete + status change; vendor profile (businessName), vendor placed-orders page, Premium purchase page. |
| 15 | Webhook raw body/idempotency absent | Mount raw webhook before `express.json`; verify signature; upsert by `stripeSessionId`; handle checkout events. |
| 16 | API standard examples generic | Rewrite PizzaHub examples; document Better Auth/Stripe exceptions; Zod details mapping; error code table. |
| 17 | Loading/error/empty states not mapped | Per-page skeletons, `error.tsx`, `global-error.tsx`, custom 404, empty states, upload failure, 401/403/404 handling, toasts only. |
| 18 | Backend on Render/Railway | **Vercel Functions + Express 5 zero-config**, serverless DB/body/timeout/cold-start rules (see §6). |
| 19 | No QA matrix, seed, env matrix, commit map; success prematurely ticked | Add QA matrix, seed scripts, env tables, deployment checklist, 24/14 commit budget, `[ ]` success criteria. |

---

## 4. Requirement Traceability

| Requirement area | v1 | v2.1 action |
|---|---|---|
| Navbar/footer/auth-state update | ⚠️ | Exact links, dropdown, `useSession`, `router.refresh`, X logo, contact/social |
| Home hero/featured/categories/2 extra sections | ⚠️ | Hero CTA, 6+ featured (premium first), 6 categories, Why Choose + How It Works |
| Browse/search/filter/sort/pagination | ✅ | Keep; add URL params, debounce, loading/empty, filter counts |
| Item details + order rules | ❌ | Private route, gallery, vendor/admin blocks, invalid id, duplicate/date checks |
| Auth (email/Google/roles/password/admin) | ⚠️ | Better Auth config, role select, password hooks, Google, admin not public |
| Vendor dashboard (all 6 areas) | ⚠️ | Exact overview stats, item CRUD, availability, orders, subscription, profile |
| Customer dashboard | ⚠️ | Total/pending/accepted/rejected + My Orders + cancel + timeline |
| Admin dashboard | ⚠️ | Exact stats, users search/filter/block/detail, menu approve/reject/delete, read-only transactions |
| Payment/Stripe/webhook | ⚠️ | Checkout, success/cancel, webhook raw, lifetime premium, featured/badge |
| Security/JWT/ownership/blocked | ⚠️ | JWKS verify, DB role, blocked check, explicit ownership, validation, rate limit |
| Design/responsive/professional UI | ❌ | New dark/orange token system matched to references; no 3D/glass overload |
| Loading/error/empty/toasts | ⚠️ | Full state matrix per page; sonner; no `alert()` |
| Optional/challenges | ⚠️ | Search+sort, JWT, UI polish; theme + timeline; reviews stretch |
| Deployment/README/commits | ⚠️ | Two Vercel projects + Atlas, seed, QA, commit budget, README checklist |

---

## 5. Architecture v2.1

### 5.1 System diagram

```text
Browser (React 19)
  │  HTTPS + Better Auth session cookie
  ▼
Next.js 16 (Vercel project 1 — pizzahub)
  ├─ RSC pages, UI, proxy.ts guard
  ├─ Better Auth /api/auth/[...all]
  ├─ JWT plugin: /api/auth/token, /api/auth/jwks
  └─ Mongo driver ──────────────┐
                                ▼
                         MongoDB Atlas
                                ▲
  Authorization: Bearer <JWT>   │
  ▼                             │
Express 5 API (Vercel project 2 — pizzahub-api)
  ├─ src/app.ts default export (Vercel entry)
  ├─ verifyJWT (jose + remote JWKS)
  ├─ load user (role, isBlocked, subscription)
  ├─ role/ownership/business rules
  ├─ menu/orders/upload/dashboard
  └─ Stripe checkout + raw webhook
        │
        ├─ Stripe (payment)
        └─ ImgBB (menu/profile images)
```

### 5.2 Why Better Auth in Next, not Express

- Session cookie stays on the Next domain → SSR guards work; no cross-site cookie pain.
- Express is stateless with short-lived JWT → clean CORS; no cookies cross-origin.
- `/api/auth/jwks` gives Express a real public-key verification path, satisfying the JWT challenge properly.
- Both apps live on Vercel but remain separate projects/repos.

### 5.3 Auth flow

1. User signs up/in via Better Auth (email or Google).
2. Better Auth stores the user in `users` and sets an HTTP-only session cookie.
3. Client calls `authClient.token()` → 15m JWT.
4. `apiFetch` sends `Authorization: Bearer <JWT>` to Express.
5. Express verifies signature/issuer/audience via JWKS, then loads the user from Mongo.
6. Express rejects if blocked/ownership invalid; returns standard JSON.
7. Client on 401 refreshes the token once; on `ACCOUNT_BLOCKED` signs out → `/blocked`.

### 5.4 Page guard flow

1. `proxy.ts` checks session-cookie presence for `/dashboard`, `/profile-settings`, `/payment` (optimistic only).
2. Server layout calls `auth.api.getSession` + Mongo `getCurrentUser`; redirects if absent/blocked/wrong role.
3. `dashboard/page.tsx` redirects by role; per-role layouts re-check role.
4. `(protected)` layout guards `/menu/[id]`, profile, and payment pages.

### 5.5 Payment flow

1. Vendor clicks Upgrade → `POST /api/payment/create-checkout-session` with JWT.
2. Server uses vendor id from JWT, creates/reuses a Stripe customer, creates a one-time Checkout (inline $99.99 price), returns URL.
3. Stripe redirects to `/payment/success` or `/payment/cancel`.
4. Success page **never activates**; it polls `GET /api/payment/subscription`.
5. Stripe webhook verifies raw signature, saves the transaction, activates lifetime premium (no expiry).
6. Premium is lifetime: no renewal and no cancel/resume endpoints; expiry sync only clears stale premium state and deactivates extra items.

### 5.6 Order flow

1. Logged-in customer/vendor opens item details.
2. Vendor own item → disabled; admin → no order button; invalid/non-approved item → error.
3. Order dialog validates delivery date (today/future), address, message.
4. API derives customer, vendor, and item snapshot; blocks duplicate active order; saves `pending`.
5. Vendor accepts/rejects atomically only from `pending`; customer cancels only `pending`.
6. Status timeline: `pending → accepted`, or terminal `rejected`/`cancelled`.

---

## 6. Backend on Vercel (Express 5) — Critical Detail

### 6.1 Entry model

```text
src/app.ts             # Express app; default export; NO app.listen
scripts/dev-server.ts  # local only: imports app, app.listen(PORT)
```

- Vercel's zero-config Express support detects `src/app.ts`, bundles the app as a single function, and forwards requests with the full path. Express routes stay `/api/...`.
- Do **not** add `api/index.ts` or rewrites unless Vercel fails to detect the app; the primary path is zero-config.
- `scripts/dev-server.ts` ensures Vercel never sees an `app.listen` entry.
- `npm run dev` uses `tsx watch scripts/dev-server.ts`; `vercel dev` also works.

### 6.2 Serverless rules

| Concern | Rule |
|---|---|
| Mongo connection | Global cached Mongoose promise; `maxPoolSize: 5`, `bufferCommands: false`, `serverSelectionTimeoutMS: 5000`; connect middleware before routes |
| Indexes | `autoIndex: false` in production; run `npm run db:indexes` once (local/Atlas), never on cold start |
| Request body | Vercel Functions cap ~4.5MB → menu/profile upload max **3MB**; JSON limit 1MB; client validates/compresses |
| File uploads | Multer memory storage only; send base64 to ImgBB; no filesystem writes |
| Timeout | Keep every handler well under 10s; no long loops; Stripe webhook does one retrieve + DB write |
| Cold start | Cache JWKS, Mongo client, Stripe client at module scope; no top-level DB connect |
| Rate limit | `express-rate-limit` is per function instance; best-effort. Better Auth rate limit on client. Optional Upstash for distributed limits |
| Static files | `express.static` is ignored on Vercel; no server static assets |
| Trust proxy | `app.set('trust proxy', 1)` for correct IPs behind Vercel |
| Error handling | Express 5 forwards async errors; global error handler last; never swallow; log method/path/status only |
| Path syntax | Express 5/path-to-regexp v8: no bare `'*'` routes; use `app.use` for 404 |
| Bundle | Express + Mongoose + Stripe + `jose` well under 250MB |
| Region | Set server project to a region near users/Atlas (e.g. Singapore/Mumbai); optional |

### 6.3 Vercel-specific auth/payment notes

- Express `BETTER_AUTH_URL` = **client** Vercel URL; `jose` fetches `https://<client>.vercel.app/api/auth/jwks` and verifies issuer/audience.
- CORS allowlist = client Vercel URL (plus optional preview origins); `Authorization` header allowed; no credentials.
- Stripe webhook URL = `https://<server>.vercel.app/api/payment/webhook`; mount `express.raw` before `express.json`; Vercel does not pre-parse the body.
- Stripe SDK timeout/retries configured; webhook returns 200 fast; invalid signature 400.
- Google OAuth stays on the client project; Express never handles Google.
- Both projects share Atlas; use a least-privilege DB user and a strong password. Allow Vercel's dynamic IPs (`0.0.0.0/0`) or use Vercel Secure Compute if available.

---

## 7. Design System v2.1 (Reference-Matched)

### 7.1 Direction

- **Image 2 (BURGXL)** → landing: near-black, centered small nav, orange active link, 3-line giant display headline, short body, two CTAs, large product image right, subtle topographic line pattern.
- **Image 1 (NeuroBank)** → dashboard: fixed sidebar, profile block, grouped nav, bottom gradient upsell card, topbar, bento stat cards, donut/bar/line charts, dense transaction rows.
- Adapt both to **pizza content and PizzaHub branding**. Do not copy BURGXL/NeuroBank names, logos, burger/finance assets. Use them as layout/mood references only.
- Target: 90–95% layout fidelity, original assets/copy.
- **Dark default** (matches references); light theme is full cream/warm. If the grader strictly wants cream default, flip one `defaultTheme` line later.

### 7.2 Tokens (Tailwind v4, no `tailwind.config.ts`)

| Token | Dark | Light |
|---|---|---|
| background | `#070708` | `#FFF9F1` |
| surface | `#0E0E11` | `#FFF3E6` |
| card | `#121216` | `#FFFFFF` |
| elevated | `#18181D` | `#FFFFFF` |
| border | `#26262C` | `#EADFD2` |
| border-strong | `#34343C` | `#DCCBB8` |
| foreground | `#F5F1E8` | `#1A1512` |
| muted-foreground | `#9B9BA4` | `#6B6259` |
| brand | `#FF9F1C` | `#FF9F1C` |
| brand-hover | `#FFB347` | `#E8890C` |
| brand-foreground | `#0A0A0A` | `#0A0A0A` |
| red accent | `#E63946` | `#D92D3A` |
| success | `#2ECC71` | `#1F9D55` |
| warning | `#F4A261` | `#B7791F` |
| danger | `#EF4444` | `#DC2626` |
| chart 1–5 | `#FF9F1C`, `#E63946`, `#F4A261`, `#F5F1E8`, `#2A9D8F` | warm palette, darker |

Shape/spacing:

- `--radius: 0.625rem`; cards `rounded-xl`, buttons/inputs `rounded-lg`.
- Container `max-w-[1240px]`; page padding `px-4 sm:px-6 lg:px-8`; section `py-16 lg:py-24`; card gap `gap-6`.
- 1px borders; subtle shadow; no heavy glass.

### 7.3 Typography

- Display: **Archivo Black** (`--font-archivo`) for h1/h2.
- Body: **Figtree** (already in project, `--font-figtree`) for UI/body.
- Drop Poppins/Inter/Bebas/Geist; keep two families.
- H1 `clamp(3rem, 7vw, 5.25rem)`, line-height 0.92, letter-spacing -0.02em.
- H2 `clamp(2rem, 4vw, 3rem)`, line-height 1.
- H3 1.25rem/600; body 1rem/1.6; small 0.875rem; eyebrow 0.75rem uppercase tracking 0.18em orange.
- Dashboard numbers: Figtree 600/700, `tabular-nums`.

### 7.4 Landing blueprint (BURGXL adapted)

```text
[PizzaHub]   Home  Browse Menu            [theme] [Sign In] [Sign Up]
────────────────────────────────────────────────────────────────────
HOT.
FRESH.                         [ large pizza image ]
PIZZA.  ← orange               [ plate glow / dark bg ]
description (max 430px)
[Explore Pizza Menu] [How It Works]
────────────────────────────────────────────────────────────────────
Featured Menu Items                                View all →
[card][card][card]  /  [card][card][card]
Pizza Categories: 6 tiles
Why Choose PizzaHub? 4 benefits
How It Works: 01 Browse → 02 Order → 03 Track
CTA banner → Browse Menu
Footer: logo/desc | links | contact | social (X) | copyright
```

Rules:

- Hero headline 3 lines, last line orange; body copy max 430px; CTAs exactly `Explore Pizza Menu` + secondary.
- Featured: at least 6 approved items; premium vendors first; premium badge.
- Categories: exact 6 assignment categories; equal tiles.
- Extra sections: Why Choose PizzaHub + How It Works (2 required).
- Subtle topographic SVG pattern; radial orange glow; no 3D.
- Framer Motion: stagger hero lines, fade-up sections, hover lift; respect reduced motion.

### 7.5 Dashboard blueprint (NeuroBank adapted)

```text
┌────────────┬───────────────────────────────────────────────────┐
│ PizzaHub   │ Vendor Overview          [This Month] [+ Add Item] │
│ avatar     │ ┌────────┐┌────────┐┌────────┐┌────────┐            │
│ name/role  │ │Items   ││Active  ││Pending ││Accepted│            │
│            │ └────────┘└────────┘└────────┘└────────┘            │
│ Overview   │ ┌────────────────────┐┌──────────────────────┐     │
│ Menu Items │ │ Orders by status   ││ Items by category    │     │
│ Orders     │ │ bar chart          ││ donut chart          │     │
│ ...        │ └────────────────────┘└──────────────────────┘     │
│ [Upgrade]  │ ┌───────────────────────────────────────────────┐  │
└────────────┴─│ Recent orders table / accept-reject actions   │──┘
               └───────────────────────────────────────────────┘
```

- Sidebar 264px; logo, profile block, grouped nav, active item orange left border, bottom upgrade card for free vendors.
- Topbar: page title, date range pill, primary action.
- Stat cards: real counts only; no fake earnings/deltas.
- Charts: Recharts, CSS-variable colors, subtle grid.
- Tables: status badges, row hover, mobile card fallback.
- Sidebar drawer on mobile; profile section present.

### 7.6 Component rules

- `Button`: primary orange/black text, outline, ghost, destructive, link; `h-10/11`, `rounded-lg`, consistent everywhere.
- `Card`: `bg-card border rounded-xl`, equal heights via `items-stretch`/`h-full`.
- Inputs/selects: `h-11`, dark surface, orange focus ring.
- Badges: pending amber, approved/accepted green, rejected/cancelled gray/red, inactive slate, premium orange.
- Menu cards: image `aspect-[4/3] object-cover`, category chip, premium badge, title, vendor, location, orange price, View Details; equal height; line-clamp.
- Auth pages: split brand panel + form card; role cards; Google button; password hints.
- Logo: original PizzaHub wordmark + orange slice mark; same size in navbar/footer.
- Icons: hugeicons only; consistent 18/20px.
- Footer: logo/description, quick links, contact, social (X logo, not Twitter bird), copyright.

### 7.7 States, responsive, accessibility

- Skeletons matching card/table shapes; empty states with icon + action; error states with retry.
- 375/768/1024/1280 breakpoints; tables → cards on mobile; hero stacks.
- Focus rings, labels, aria, keyboard, contrast, reduced motion.
- Toasts (sonner) for all actions; no `alert()`.
- Images: `next/image`, remotePatterns for `i.ibb.co` + `images.unsplash.com`, fallback placeholder.

---

## 8. Data Model v2.1

### 8.1 `users` (Better Auth-managed, `modelName: 'users'`)

`_id` ObjectId, `name`, `email` unique, `emailVerified`, `image`, `role` (`customer|vendor|admin`), `isBlocked`, `businessName`, `subscriptionPlan` (`free|premium`; premium is lifetime), `subscriptionExpiresAt` (always null), `subscriptionCancelAtPeriodEnd` (unused), `stripeCustomerId`, `ratingAvg`, `ratingCount` (optional reviews), `createdAt`, `updatedAt`.

- Better Auth `additionalFields`: role input true but enum excludes admin; isBlocked/plan/expiry/customerId/cancel flag input false; businessName input true.
- `databaseHooks.user.update.before`: reject any role change from profile updates.
- Admin created by seed script (sign up then direct DB role update), never public signup.
- Express `User` Mongoose model uses `collection: 'users'`, `autoIndex: false`, ObjectId refs.

### 8.2 `menuItems`

`_id`, `vendorId` (ObjectId ref users), `itemName`, `category` (exact 6), `description`, `price` (number, min 0), `location`, `images` (1–5 ImgBB URLs), `status` (`pending|approved|rejected|inactive`, default pending), `rejectionReason` (optional), `ratingAvg`, `ratingCount`, `createdAt`, `updatedAt`.

- **No `isActive` field.**
- Indexes: `{vendorId, status}`, `{status, createdAt}`, `{category}`, `{location}`, text `{itemName, description}`.
- Public filter: `status: approved` only.

### 8.3 `orders`

`_id`, `itemId`, `vendorId`, `customerId`, `itemName`, `itemImage`, `itemPrice`, `vendorName`, `deliveryDate` (UTC midnight), `deliveryAddress`, `message`, `status` (`pending|accepted|rejected|cancelled`), `rejectionReason` (optional), `createdAt`, `updatedAt`.

- Snapshot fields keep order history intact if item/vendor changes/deletes.
- Indexes: `{vendorId, status, createdAt}`, `{customerId, status, createdAt}`, `{deliveryDate}`.
- Duplicate active order: partial unique `{itemId, customerId, deliveryDate}` where status in pending/accepted; plus app-level check. If Mongo rejects `$in` partial filter, add `activeOrder: true` and index that.

### 8.4 `transactions`

`_id`, `vendorId`, `plan: premium`, `amount` (cents), `currency: usd`, `stripeSessionId` unique, `stripeSubscriptionId` (unused — one-time payment), `status` (`pending|success|failed`), `createdAt`, `updatedAt`.

- Indexes: `{vendorId}`, `{stripeSessionId}` unique, `{status}`, `{createdAt}`.

### 8.5 `reviews` (optional stretch only)

`_id`, `itemId`, `vendorId`, `customerId`, `rating` 1–5, `comment`, `createdAt`; unique `{itemId, customerId}`; index `{vendorId}`. Aggregates stored on menu item + vendor. Core stays at 4 collections if reviews are not implemented.

### 8.6 State machines

**Menu:** `pending → approved | rejected`; `rejected → pending` on vendor edit; `approved ↔ inactive`; admin can set `approved | rejected | inactive`; `rejected` never public.

**Order:** `pending → accepted | rejected | cancelled`; accepted/rejected/cancelled terminal; only pending transitions; atomic filter `{_id, status: pending, vendorId/customerId}`.

**Premium:** `free → premium` only via the verified checkout webhook; premium is lifetime (no auto-downgrade); expiry sync only clears stale premium state and deactivates extra items.

---

## 9. API v2.1

### 9.1 Standard response

- Success: `{ success: true, message, data, meta: { timestamp, pagination? } }`
- Error: `{ success: false, message, error: { code, details? }, meta: { timestamp } }`
- Pagination: `{ page, limit, total, totalPages, hasNext }`
- No `data` on error; validation details `[{ field, issue }]`.
- Codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `INVALID_TOKEN`, `FORBIDDEN`, `ACCOUNT_BLOCKED`, `NOT_FOUND`, `DUPLICATE_ORDER`, `PLAN_LIMIT`, `INVALID_STATE`, `UPLOAD_FAILED`, `PAYMENT_ERROR`, `INTERNAL_ERROR`.
- Better Auth endpoints return Better Auth's own shape; frontend uses `authClient`, not `apiFetch`.
- Stripe webhook returns `{ received: true }`; not the standard envelope.
- HTTP: 200/201, 400, 401, 403, 404, 409, 413, 429, 500.

### 9.2 Endpoints

**Auth (Better Auth-managed, do not wrap):** `/api/auth/sign-up/email`, `/sign-in/email`, `/sign-in/social`, `/callback/google`, `/get-session`, `/token`, `/jwks`, `/sign-out`, `/update-user`.

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/api/health` | Public | Vercel health check |
| GET | `/api/users/me` | Private | Fresh user (role, plan, blocked) |
| GET | `/api/users` | Admin | search, role, page, limit |
| GET | `/api/users/:id` | Admin | Detail + item/order counts |
| PATCH | `/api/users/:id/block` | Admin | Block; vendor items inactive |
| PATCH | `/api/users/:id/unblock` | Admin | Unblock |
| GET | `/api/menu` | Public | search/category/location/sort/page/limit |
| GET | `/api/menu/featured` | Public | Approved, premium first, 8 |
| GET | `/api/menu/filters` | Public | Categories/locations counts |
| GET | `/api/menu/:id` | Public | Approved only; else 404 |
| POST | `/api/menu` | Vendor | Create pending; free limit |
| GET | `/api/menu/vendor/me` | Vendor | Own items, all statuses |
| PATCH | `/api/menu/:id` | Vendor own | Edit; rejected → pending |
| DELETE | `/api/menu/:id` | Vendor own/Admin | Hard delete; orders snapshot safe |
| PATCH | `/api/menu/:id/availability` | Vendor own | approved ↔ inactive; free limit |
| GET | `/api/menu/admin/all` | Admin | search/status/category/page |
| PATCH | `/api/menu/:id/status` | Admin | approve/reject/inactive + reason |
| POST | `/api/orders` | Customer/Vendor | Vendor own item blocked; admin blocked |
| GET | `/api/orders/my` | Customer/Vendor | Placed orders |
| GET | `/api/orders/vendor` | Vendor | Incoming orders |
| PATCH | `/api/orders/:id/accept` | Vendor own | Atomic pending only |
| PATCH | `/api/orders/:id/reject` | Vendor own | Atomic pending only |
| PATCH | `/api/orders/:id/cancel` | Customer/Vendor own | Pending only |
| GET | `/api/orders/:id` | Owner/Admin | Detail |
| POST | `/api/upload/imgbb` | Private | multipart, max 3MB, jpg/png/webp |
| POST | `/api/payment/create-checkout-session` | Vendor | One-time $99.99 checkout |
| GET | `/api/payment/subscription` | Vendor | Plan/premium state + price |
| GET | `/api/payment/transactions` | Admin | Read-only, paginated |
| POST | `/api/payment/webhook` | Stripe | Raw body, signature |
| GET | `/api/dashboard/vendor` | Vendor | Stats + charts |
| GET | `/api/dashboard/customer` | Customer | Stats |
| GET | `/api/dashboard/admin` | Admin | Stats + charts |
| GET/POST | `/api/menu/:id/reviews` | Public/Customer | Optional stretch |

### 9.3 Critical snippets

Better Auth JWT config:

```ts
jwt({
  jwt: {
    issuer: env.BETTER_AUTH_URL,
    audience: env.BETTER_AUTH_URL,
    expirationTime: '15m',
    definePayload: ({ user }) => ({ role: user.role, email: user.email, name: user.name }),
  },
})
```

Express verification:

```ts
const JWKS = createRemoteJWKSet(new URL(`${env.BETTER_AUTH_URL}/api/auth/jwks`))
const { payload } = await jwtVerify(token, JWKS, {
  issuer: env.BETTER_AUTH_URL,
  audience: env.BETTER_AUTH_URL,
})
const user = await User.findById(payload.sub).lean()
if (!user) throw new ApiError(401, 'Authentication required.', 'UNAUTHORIZED')
if (user.isBlocked) throw new ApiError(403, 'Account blocked.', 'ACCOUNT_BLOCKED')
req.user = { id: String(user._id), role: user.role, plan: user.subscriptionPlan }
```

Webhook mount order:

```ts
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
app.use(express.json({ limit: '1mb' }))
```

Duplicate order index:

```ts
orderSchema.index(
  { itemId: 1, customerId: 1, deliveryDate: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'accepted'] } } }
)
```

Vercel-safe Mongo connection:

```ts
let cached = globalThis.__mongooseCache ??= { conn: null, promise: null }
export async function connectDb() {
  if (cached.conn) return cached.conn
  cached.promise ??= mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 5,
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  })
  cached.conn = await cached.promise
  return cached.conn
}
```

### 9.4 Query params

- Menu: `search`, `category`, `location`, `sort=price_asc|price_desc|newest`, `page`, `limit` (max 50).
- Admin/vendor lists: `search`, `status`, `role`, `category`, `page`, `limit`.
- Orders: `status`, `page`, `limit`.
- Transactions: `status`, `page`, `limit`.
- Escape regex input; Zod validate; reset page on filter change.

---

## 10. Frontend Routes & Page Specs

| Route | Access | Key content |
|---|---|---|
| `/` | Public | Hero, 6+ featured (premium first), 6 categories, Why Choose, How It Works, CTA |
| `/menu` | Public | Search, category/location filters, sort, grid, pagination, loading/empty |
| `/menu/[id]` | Private | Gallery, category, description, price, location, vendor info + badge, order dialog; vendor own/admin blocked; invalid 404 |
| `/sign-in` | Public | Email/password, Google, redirect by role, toast |
| `/sign-up` | Public | Name, email, password, optional image, role cards, Google, password rules |
| `/dashboard` | Private | Redirect by role |
| `/dashboard/vendor/overview` | Vendor | 5 stats + charts + recent orders |
| `/dashboard/vendor/menu-items` | Vendor | Own items, status, availability, edit/delete, rejection reason |
| `/dashboard/vendor/add-item` | Vendor | Form, ImgBB upload, pending notice, free limit banner |
| `/dashboard/vendor/orders` | Vendor | Customer info, item, date/address/message, accept/reject once |
| `/dashboard/vendor/my-orders` | Vendor | Orders vendor placed as customer |
| `/dashboard/vendor/subscription` | Vendor | Plan, lifetime upgrade, benefits |
| `/dashboard/customer/overview` | Customer | Total/pending/accepted/rejected/cancelled |
| `/dashboard/customer/my-orders` | Customer | Orders, detail, cancel pending, timeline |
| `/dashboard/admin/overview` | Admin | Exact stats + charts |
| `/dashboard/admin/users` | Admin | Search name/email, role filter, detail, block/unblock |
| `/dashboard/admin/menu-items` | Admin | Search/filter, approve/reject, status, delete |
| `/dashboard/admin/transactions` | Admin | Read-only table, vendor/plan/amount/status/date |
| `/dashboard/profile-settings` | All | Name, image, businessName; role/plan read-only |
| `/payment/success` | Vendor | Confirmation + poll; no activation |
| `/payment/cancel` | Vendor | Retry; no activation |
| `/blocked`, `/unauthorized`, 404, error | All | Clear states + actions |

Navbar:

- Public: Home, Browse Menu, Sign In, Sign Up.
- Logged in: Home, Browse Menu, Dashboard, role link (My Orders/Admin).
- Profile dropdown: name, image, Dashboard, Profile Settings, Logout.
- Updates immediately via `useSession`; `router.refresh()` after sign-in/out.
- Theme toggle; mobile sheet.

Footer: logo/description, links, contact, social (X logo), copyright.

---

## 11. Business Rules

- **Free plan:** max 3 non-rejected/non-inactive items (pending + approved); block create/reactivate/admin approve with `PLAN_LIMIT`. **Premium:** unlimited.
- **Premium:** featured placement first on home; Premium badge; one-time lifetime upgrade purchase.
- **Downgrade:** keep 3 oldest approved active; set extra approved to inactive; pending items cannot be approved until under limit.
- **Order:** vendor cannot order own item; admin cannot order; vendor can order others; customer logged in; only approved item; duplicate active order blocked; delivery date today/future normalized UTC.
- **Order transitions:** only pending accepts/rejects/cancels; atomic update; terminal states immutable; ownership enforced.
- **Menu visibility:** public only `approved`; rejected/inactive/pending hidden; admin can delete; vendor edits rejected → pending.
- **Profile:** name/image/businessName editable; role/subscription/isBlocked never editable by user.
- **Admin:** block/unblock, approve/reject/delete items, read-only transactions; cannot edit payment status; cannot block self/admin.
- **Orders are not paid:** no Stripe on customer ordering; only show place-order; Stripe only for the vendor Premium purchase.
- **Admin creation:** seed only; no public admin signup.

---

## 12. Security Checklist

- [ ] All secrets in env; `.env` ignored; `.env.example` without values
- [ ] Better Auth secret, Mongo URI, Google, Stripe, ImgBB server-only
- [ ] JWT verified with JWKS, issuer, audience; 15m expiry
- [ ] Role/blocked/plan loaded from DB, never trusted from client
- [ ] All private Express routes behind `verifyJWT`; role middleware per route
- [ ] Resource ownership checked for menu/order/profile operations
- [ ] 401 vs 403 correct; blocked code consistent
- [ ] Zod validation on every body/query/param; regex escaped
- [ ] Stripe webhook raw body + signature; premium only from webhook
- [ ] Prevent checkout sessions for other vendors; metadata from JWT
- [ ] Idempotent webhook/transaction upsert; handle replay
- [ ] Rate limit auth/upload/API; Helmet; CORS allowlist; JSON limit
- [ ] Upload MIME/size validation (3MB Vercel-safe); ImgBB key server-side
- [ ] Password min 6 + uppercase + lowercase; admin not public
- [ ] No token in localStorage; in-memory cache + refresh
- [ ] No stack traces in production; toasts not alerts
- [ ] Blocked vendor items set inactive
- [ ] Admin cannot edit transactions; no endpoint
- [ ] Vercel envs scoped to correct project; no secret in `NEXT_PUBLIC_*`
- [ ] Atlas least-privilege user; no credentials in repo

---

## 13. Challenges & Optional Features

Mandatory challenges:

1. Advanced search + filter + price asc/desc + pagination.
2. JWT verification middleware with invalid/expired rejection.
3. Professional UI: reference-matched tokens, consistent headings/buttons, equal cards, skeletons, empty/error states, responsive.

Optional (at least 2):

- **Dark/light mode** (core; cream light).
- **Order status timeline** (core; pending → accepted, terminal rejected/cancelled; no fake Delivered step).
- **Reviews & ratings** (stretch, item + vendor aggregate; only if core is stable).
- Skip favorites and email notifications to protect the timeline.

---

## 14. Implementation Phases & Commit Budget

| Phase | Work | Definition of Done |
|---|---|---|
| 0 | Repo cleanup + move plan/design reference into client docs | Root has only `Assignment.pdf` + two repos |
| 0.5 | Static design reference (home + vendor dashboard mock) | Moved to `docs/design-reference/` |
| 1 | Client foundation/auth: tokens, fonts, shadcn, Better Auth, JWT, proxy, guards | Build/lint/typecheck pass; auth pages + role placeholders; JWT-to-Express pending Phase 2 |
| 2 | Server core: models, middleware, menu, orders, upload, seed | Postman passes; public/private access correct |
| 3 | Stripe: checkout, webhook, lifetime premium | Premium only after webhook; replay idempotent |
| 4 | Public UI: home, menu, details, auth, order dialog | Responsive; loading/empty; redirects |
| 5 | Dashboards: vendor, customer, admin, charts, profile | All role pages; wrong URL blocked |
| 6 | Optionals + QA: theme, timeline, reviews stretch, QA matrix | 20/12 commits; all checks pass |
| 7 | Deploy to Vercel (client + server) + README | Both live; admin creds; no CORS/reload/504 errors |

Commit budget: **24 client / 14 server** minimum, descriptive messages, split per feature (no meaningless commits). Prefixes are fine; the assignment asks for descriptive messages.

### Suggested client commit sequence (24)

1. `chore: initialize Next.js 16 with Tailwind v4 and shadcn`
2. `feat: add PizzaHub design tokens, fonts, and theme provider`
3. `feat: build shared logo, navbar, footer, and theme toggle`
4. `feat: build home hero with motion and pizza imagery`
5. `feat: add featured menu items section`
6. `feat: add pizza categories section`
7. `feat: add why choose and how it works sections`
8. `feat: build browse menu search, filters, and sort`
9. `feat: build responsive menu grid and pagination`
10. `feat: build item details gallery and vendor info`
11. `feat: add order dialog and validation`
12. `feat: integrate Better Auth client and sign up`
13. `feat: add sign in, Google auth, and redirects`
14. `feat: add proxy and server-side role guards`
15. `feat: build dashboard shell and sidebar`
16. `feat: build vendor overview stats and charts`
17. `feat: build vendor menu items table and actions`
18. `feat: build add menu item form and image upload`
19. `feat: build vendor orders accept/reject flow`
20. `feat: build vendor Premium purchase page`
21. `feat: build customer overview and my orders`
22. `feat: build admin overview and user management`
23. `feat: build admin menu moderation and transactions`
24. `feat: add profile settings, blocked/unauthorized pages, and 404`
25. `feat: add loading, empty, and error states across pages`
26. `docs: add README, screenshots, and challenge notes`

### Suggested server commit sequence (14)

1. `chore: initialize Express 5 TypeScript server for Vercel`
2. `feat: add env validation, Mongo connection, and API response utilities`
3. `feat: add user, menu item, order, and transaction models`
4. `feat: add JWKS JWT verification middleware`
5. `feat: add role, blocked-user, and ownership middleware`
6. `feat: add menu CRUD with search, filter, and sort`
7. `feat: add premium limits and featured menu query`
8. `feat: add order creation and listing endpoints`
9. `feat: add atomic order accept, reject, and cancel`
10. `feat: add ImgBB upload endpoint with validation`
11. `feat: add Stripe checkout and raw webhook`
12. `feat: add one-time checkout, webhook activation, and expiry sync`
13. `feat: add dashboard aggregates and admin user endpoints`
14. `feat: add admin menu moderation and read-only transactions`
15. `chore: add seed scripts, health check, and API documentation`

---

## 15. QA / Acceptance Matrix

| Flow | Expected |
|---|---|
| Sign up customer/vendor | Redirect correct dashboard; password rules enforced |
| Google sign-in | Session works; default customer |
| Reload private route | No redirect to sign-in |
| Wrong role URL | Blocked/redirected |
| Blocked user | 403 + `/blocked`; no protected API access |
| Browse logged out | Works; details click → sign-in |
| Search/filter/sort/pagination | Correct results; URL params |
| Item details | Approved only; invalid 404; vendor own/admin no order |
| Place order | Pending; duplicate active order blocked |
| Vendor accept/reject | Only pending, once; others' orders 403 |
| Customer cancel | Pending only; accepted cannot cancel |
| Free vendor 4th item | Blocked with upgrade message |
| Admin approve 4th | Blocked; premium unlimited |
| Premium checkout | Success page no activation; webhook activates |
| Cancel/expire | Downgrade; extras inactive; featured/badge correct |
| Admin users/menu/transactions | Search/filter/block/approve/reject/delete; transactions read-only |
| UI | 375/768/1280; theme; toasts; skeletons; 404/error |
| Vercel API cold start | `/api/health` 200; protected route 401 without token; JWT route works |
| Vercel CORS | Preflight from client origin succeeds |
| Vercel Stripe webhook | Signature verified; premium activates; duplicate safe |
| Vercel upload | 3MB limit; larger file gives clear 413 |

---

## 16. Deployment on Vercel (Both Apps)

### 16.1 Project layout

| Project | Repo | Vercel URL (example) |
|---|---|---|
| Client (Next.js 16) | `pizzahub-client` | `https://pizzahub.vercel.app` |
| Server (Express 5) | `pizzahub-server` | `https://pizzahub-api.vercel.app` |

- Two separate Vercel projects, two repos.
- Server project root = repo root; Vercel auto-detects Express from `src/app.ts` (default export).
- Client project root = repo root; Vercel auto-detects Next.js.
- No monorepo, no shared package.

### 16.2 Server project (Vercel)

- Entry: `src/app.ts` default export; **no** `app.listen`.
- Local: `scripts/dev-server.ts`.
- `package.json`: `"type": "module"`, `engines.node: "22.x"`, scripts `dev`, `build` (tsc --noEmit), `db:indexes`, `seed:admin`, `seed:demo`.
- Vercel build: auto; no `vercel.json` required. Optional `maxDuration` only if needed.
- Env:
  - `MONGODB_URI`
  - `BETTER_AUTH_URL` = client Vercel URL (JWT issuer/audience + JWKS)
  - `CLIENT_URL` = client Vercel URL (CORS)
  - `ALLOWED_ORIGINS` optional preview origins
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `IMGBB_API_KEY`
  - `NODE_ENV=production`
  - optional `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
- Health: `GET https://pizzahub-api.vercel.app/api/health`.
- Stripe webhook: `https://pizzahub-api.vercel.app/api/payment/webhook`.
- Atlas allowlist: Vercel dynamic IPs (`0.0.0.0/0`) with a least-privilege DB user; or Secure Compute.
- Region: close to Atlas/users (e.g. Singapore/Mumbai); optional.
- Cold start: Mongo/JWKS cached; never top-level DB connect.

### 16.3 Client project (Vercel)

- Next.js 16 on Vercel.
- Env:
  - `MONGODB_URI`
  - `BETTER_AUTH_SECRET`
  - `BETTER_AUTH_URL` = client Vercel URL
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXT_PUBLIC_APP_URL` = client Vercel URL
  - `NEXT_PUBLIC_API_URL` = `https://pizzahub-api.vercel.app/api`
- Google OAuth redirect: `https://pizzahub.vercel.app/api/auth/callback/google`.
- `next.config.ts` remotePatterns for ImgBB/Unsplash.
- Better Auth Mongo client cached; `nextCookies()` last plugin.
- `proxy.ts` + role layouts; no DB in proxy.

### 16.4 Deployment order

1. Mongo Atlas DB + user; allow Vercel.
2. Create both Vercel projects with chosen names.
3. Set server env (client URL can be the chosen production URL); deploy server.
4. Set client env (`NEXT_PUBLIC_API_URL` server URL); deploy client.
5. If URLs were placeholders, update server `BETTER_AUTH_URL`/`CLIENT_URL` and redeploy server.
6. Add Google redirect URI; add Stripe webhook.
7. Run `seed:admin` and `seed:demo` locally against Atlas.
8. Test: health, CORS preflight, JWT route, signup/login, private reload, Stripe test, upload, admin creds.

### 16.5 README / submission

- Features, tech stack/npm packages, setup, env names, live links, repos, admin credentials, Stripe test card, challenge notes, screenshots.
- Mention Vercel serverless constraints (3MB upload, cold start, Atlas allowlist).
- Verify 20+ client / 12+ server commits.

---

## 17. Assumptions / Out of Scope / Next Steps

### 17.1 Assumptions

- Backend target is **Vercel** (Express 5), separate project from the client; no Render/Railway.
- Both apps use MongoDB Atlas; separate Vercel projects.
- Dark-first design matches references; light theme is full cream.
- Currency USD; premium $99.99 one-time (lifetime).
- Vendors can order other vendors' items; admins cannot order; vendor gets My Orders.
- Google signups default to Customer; email signup has role selection.
- Reviews are stretch; theme + timeline are the two chosen optionals.
- No Stripe on customer orders; only the vendor Premium purchase.
- Admin role change (optional in assignment) skipped.
- npm; Node 22 on Vercel; separate repos.

### 17.2 Out of scope

- 3D/Three.js, cart, order payments, email service, favorites/wishlist, real-time sockets, multi-language, admin role change, heavy test suite (manual QA + Postman is enough).

### 17.3 Immediate next steps

1. **Phase 2:** Initialize `pizzahub-server` (Express 5 on Vercel, env/db/utils, models, JWT/role/ownership middleware, health + `/users/me`).
2. **Phase 2B:** Menu, orders, upload, seed.
3. **Phase 3:** Stripe — checkout, webhook, lifetime premium.
4. **Phase 4:** Public UI.
5. **Phase 5:** Dashboards.
6. **Phase 6:** Optionals + QA.
7. **Phase 7:** Deploy both Vercel projects + README.
