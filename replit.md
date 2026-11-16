# Panel of Experts

A members-only workspace for creating a personal expert panel, asking questions, and recording searchable answers.

## Run & Operate

Use Replit's Run button to start the two managed artifact workflows:

- `artifacts/panel-of-experts: web` — React/Vite frontend at `/`.
- `artifacts/api-server: API Server` — Express backend at `/api`.

The managed workflows supply `PORT` and `BASE_PATH`; do not start a replacement root-level dev server.

- `pnpm install --frozen-lockfile` — install dependencies.
- `pnpm run typecheck` — check all workspace packages.
- `pnpm run build` — typecheck and build workspace packages.
- `pnpm --filter @workspace/db run push` — apply additive development schema changes.
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas after API contract changes.
- `GET /api/healthz` — returns `{"status":"ok"}` when the API is running.

## Environment

Clerk authentication is provisioned through Replit. Its required keys are stored in Secrets: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, and `VITE_CLERK_PUBLISHABLE_KEY`. Manage login providers through the Auth pane. Development and production use separate Clerk user stores.

Replit's development PostgreSQL database stores expert profiles, questions, and answers. `DATABASE_URL` is provided by the managed environment; never commit database credentials. Production schema changes follow Replit's Publish flow.

## Stack & Layout

- pnpm workspaces and TypeScript.
- `artifacts/panel-of-experts` — React 19, Vite, Tailwind CSS, Wouter, and Clerk.
- `artifacts/api-server` — Express, Clerk middleware/proxy, authenticated API routes, and Pino logging.
- `lib/api-spec` — OpenAPI source of truth.
- `lib/api-client-react` and `lib/api-zod` — generated API client and validation schemas.
- `lib/db/src/schema` — PostgreSQL/Drizzle tables for experts, questions, and answers.

## Routing

- `/` — public landing page; signed-in visitors go to `/dashboard`.
- `/sign-in` and `/sign-up` — branded authentication screens.
- `/dashboard` — member overview.
- `/experts` and `/experts/:id` — manage the panel and view expert histories.
- `/ask` — create a question for one expert or the full panel.
- `/questions` and `/questions/:id` — search/filter question threads and record answers.
- `/api/healthz` — API health check.

All member API calls are scoped to the signed-in Clerk user. Expert removal archives the profile so linked question and answer history remains. Answers are manually recorded in v1; AI generation is not enabled. Preserve the existing Clerk proxy wiring for publishing; its proxy is intentionally inactive during development.
