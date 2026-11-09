# Panel of Experts

A members-only website with a public landing page, branded Clerk sign-in and account creation, and a protected member welcome page.

## Run & Operate

Use Replit's Run button to start the two managed artifact workflows:

- `artifacts/panel-of-experts: web` — React/Vite frontend at `/`.
- `artifacts/api-server: API Server` — Express backend at `/api`.

The managed workflows supply `PORT` and `BASE_PATH`; do not start a replacement root-level dev server.

- `pnpm install --frozen-lockfile` — install dependencies.
- `pnpm run typecheck` — check all workspace packages.
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas after API contract changes.
- `GET /api/healthz` — returns `{"status":"ok"}` when the API is running.

## Environment

Clerk authentication is provisioned through Replit. Its required keys are stored in Secrets: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, and `VITE_CLERK_PUBLISHABLE_KEY`. Manage login providers through the Auth pane. Development and production use separate Clerk user stores.

The current routes do not use PostgreSQL, so no database is needed to run this version. The existing `@workspace/db` package requires `DATABASE_URL` if future features import it; configure a database before adding persistent data features.

## Stack & Layout

- pnpm workspaces and TypeScript.
- `artifacts/panel-of-experts` — React 19, Vite, Tailwind CSS, Wouter, and Clerk.
- `artifacts/api-server` — Express, Clerk middleware/proxy, and Pino logging.
- `lib/api-spec` — OpenAPI source of truth.
- `lib/api-client-react` and `lib/api-zod` — generated API client and validation schemas.
- `lib/db` — PostgreSQL/Drizzle support, currently unused by app routes.

## Routing

- `/` — public landing page; signed-in visitors go to `/member`.
- `/sign-in` and `/sign-up` — branded authentication screens.
- `/member` — signed-in member page.
- `/api/healthz` — API health check.

Preserve the existing Clerk proxy wiring for publishing. Its proxy is intentionally inactive during development.
