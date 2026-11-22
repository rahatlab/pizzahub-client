# Phase 1 — Client Foundation Milestone

## What is complete

- Repo cleanup: root now contains only `Assignment.pdf` + `pizzahub-client/` + `pizzahub-server/`.
- Design reference/plan moved inside the client repo:
  - `docs/PROJECT_PLAN.md`
  - `docs/design-reference/`
- Design foundation:
  - Dark-first + cream light tokens in `src/app/globals.css`
  - Archivo Black display + Figtree body fonts
  - `next-themes` dark/light provider, TanStack Query provider, Sonner toaster
  - shadcn `base-maia` components (card, input, label, select, textarea, dialog, sheet, table, tabs, badge, skeleton, avatar, dropdown, alert-dialog, tooltip, separator)
  - Brand button/input/card/select styling aligned with the reference design
- Auth foundation:
  - Better Auth at `/api/auth/[...all]` with MongoDB adapter (`users` collection)
  - JWT plugin: 15m tokens, issuer/audience = `BETTER_AUTH_URL`, role claim
  - Google provider wired conditionally from env
  - Password rules: min 6 + uppercase + lowercase (client + Better Auth hook)
  - Role selection at signup (customer/vendor); admin cannot be self-assigned
  - Profile role changes blocked server-side
  - `proxy.ts` optimistic guard + server-side session/role/blocked guards
  - JWT bearer API client with token cache/retry and blocked-account handling
  - Server-side API helper and `getCurrentUser`/`requireUser`/`requireRole`
- Pages:
  - `/sign-in`, `/sign-up` (functional email/password; Google button wired)
  - `/blocked`, `/unauthorized`
  - `/dashboard` role redirect + minimal vendor/customer/admin overview placeholders
- Environment templates:
  - `pizzahub-client/.env.example`
  - `pizzahub-server/.env.example`
  - `pizzahub-client/.env.local` is local-only and ignored

## Checks passed

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Smoke-tested on `http://localhost:3100`:

- `/sign-in` → 200
- `/sign-up` → 200
- `/blocked` → 200
- `/unauthorized` → 200
- `/dashboard` without a session → redirects to `/sign-in?redirect=...`

## Screenshots

- [Sign in](screenshots/sign-in.png)
- [Sign up](screenshots/sign-up.png)

## Not yet done

- Full signup runtime test needs MongoDB running locally (or Atlas) and a real `BETTER_AUTH_SECRET`.
- Google login needs `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` plus an authorized redirect URI.
- Express server and JWT-to-Express verification begin in Phase 2.
- Public pages, real dashboards, menu/order/payment flows are later phases.

## Phase 2 next

1. Initialize `pizzahub-server` (Express 5, Vercel `src/app.ts` default export, local `scripts/dev-server.ts`).
2. Env/db/cache, `ApiResponse`/`ApiError`, models, JWT/JWKS middleware, role/blocked/ownership, health + `/api/users/me`.
3. Verify the client JWT against the Express API.
