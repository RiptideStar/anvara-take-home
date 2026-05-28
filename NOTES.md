# Implementation Notes

A walkthrough of how this take-home was approached — architecture, each challenge,
the decisions worth defending, and how to run/verify it.

## Overview

Anvara is a two-sided **sponsorship marketplace**: sponsors run campaigns, publishers
sell ad slots. It's a pnpm monorepo with a Next.js frontend and an Express + Prisma
backend, sharing a Postgres database. Better Auth provides session-based auth.

## Architecture

- **Monorepo:** pnpm workspaces — `apps/frontend`, `apps/backend`, shared `packages/`
  (`eslint-config`, `prettier-config`, `config`/tsconfig).
- **Frontend:** Next.js 15 App Router, React 19, Tailwind **v4** (CSS-first, no config
  file), Better Auth client. Port `3847`.
- **Backend:** Express 5, Prisma 7 (`@prisma/adapter-pg`), Postgres in Docker.
  Port `4291`, DB `5498`.
- **Auth:** Better Auth — sessions are stored in the **shared Postgres DB**, and the
  session cookie is signed with `BETTER_AUTH_SECRET`. The shared DB + secret is what lets
  the backend independently validate a session the frontend issued (see Challenge 3).

## Challenge-by-challenge

### 1 — TypeScript + lint baseline

- Added missing `@types/cors` (and later `@types/pg`).
- Removed `dimensions`/`pricingModel` from ad-slot create — **those fields don't exist in
  the Prisma schema** (a planted bug).
- Added a `getParam()` helper: Express 5 types route/query params as `string | string[]`,
  so it coerces to a single string.
- Replaced all `any`, removed unused/deprecated code, added invalid-date guards, and made
  the API client actually parse `{ error }` response bodies.
- Disabled the core `no-undef` rule for TS files — redundant with `tsc`, and it can't see
  TS/DOM globals like `RequestInit` (the typescript-eslint recommendation).

### 2 — Server Components

The dashboard pages were already server components, but they rendered **client** list
components that re-fetched the role and data with `useEffect` — a request waterfall
(HTML → JS → `/auth/role` → `/campaigns`). The lists became **presentational server
components** that receive data as props; the page fetches once on the server. Added
`loading.tsx` (skeletons) and `error.tsx` (client error boundary with retry).

**Win:** data ships in the initial HTML, less client JS, no waterfall.

### 3 — API security

The backend started with no auth. The approach:

- A **second Better Auth instance on the backend**, pointed at the **same DB and secret**,
  so it validates the frontend's cookie with no extra network hop.
- `requireAuth` middleware: `auth.api.getSession({ headers: fromNodeHeaders(req.headers) })`
  → **401** if no session; then it resolves the Sponsor/Publisher row by `userId` and
  attaches `req.user` (the Express `Request` type is augmented globally).
  `requireSponsor` / `requirePublisher` enforce role → **403**.
- **Ownership:** list endpoints scope to the session's `sponsorId`; single-resource
  lookups use `findFirst({ where: { id, sponsor: { userId } } })`, so a not-owned _or_
  missing id both return **404** — deliberately not 403, to avoid leaking that another
  user's record exists.
- Frontend: `lib/server-api.ts` forwards the request cookie (via `next/headers`) so the
  Server Component fetch authenticates.

### 4 — CRUD

Owner-scoped `PUT`/`DELETE` for campaigns and ad slots. Validation (positive
budget/price, valid dates, valid enum status/type, boolean availability) → **400**;
**200** on update, **204** on delete.

### 5 — Server Actions

- `actions.ts` (`'use server'`) for create/update/delete: validate → call the backend with
  the forwarded cookie → `revalidatePath()`. Return shape `{ success?, error?, fieldErrors? }`.
- `useActionState` for form/field state (React 19's rename of `useFormState`),
  `useFormStatus` for the pending submit button.
- Shared modal create/edit forms, inline two-step delete, toast success feedback.

## Design system + bonuses

- **Editorial theme:** warm paper/ink with a forest-green accent; **Fraunces** (serif) +
  **Hanken Grotesk** via `next/font`; dark variant included.
- **Tailwind v4 fix:** the project used `bg-[--color-x]`, which is **invalid in v4**
  (it needs `var()`) and silently dropped — so themed backgrounds never rendered. All
  usages were converted to `[var(--color-x)]`.
- **Bonuses:** marketing landing page + SEO metadata, animations, friendly error/empty
  states, server-side pagination (via `searchParams`), ESLint cleanup, plus dashboard KPI
  cards, mobile hamburger nav, toast notifications, and marketplace search/filters.

## Decisions worth defending

1. **Backend Better Auth sharing the DB/secret** instead of calling the frontend's
   `/get-session`: no extra network hop; the backend validates independently.
2. **404 (not 403) for other users' resources** — avoids existence leaks.
3. **Ad-slot reads are public, campaigns are fully private.** Ad inventory is a public
   catalog (the marketplace serves logged-out visitors); campaign budgets are sensitive.
   **Writes are owner-scoped regardless.**
4. **`useActionState` over `useFormState`** — React 19 renamed it; the old alias logs a
   deprecation warning.
5. **Cookie forwarding from RSC / Server Actions** — server-to-server fetches don't carry
   the browser cookie automatically.
6. **Ownership enforced in a single relational query** (`sponsor: { userId }`) rather than
   fetch-then-check — atomic, no race.

## Known tradeoffs / next steps

- Marketplace search/filter/pagination is done in-page after fetching all rows — fine at
  seed scale; in production it would move into the Prisma query.
- The booking flow (`/book`, `/unbook`) was left close to as-is (out of scope; `unbook` is
  a test helper).
- Campaign `status` defaults to `DRAFT` on create and is editable via the edit form.
- Dashboard KPIs are computed in the page from the fetched list (the `/api/dashboard/stats`
  endpoint is unused).

## Running and verifying

```bash
pnpm setup-project   # one-time: Docker Postgres + migrate + seed
pnpm dev             # frontend :3847, backend :4291
pnpm typecheck       # clean
pnpm lint            # clean
```

Demo logins (password `password`): `sponsor@example.com`, `publisher@example.com`.

The git history walks the work challenge-by-challenge in focused commits.
