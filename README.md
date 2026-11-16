# Panel of Experts

A private, personal panel of specialists for asking thoughtful questions and keeping expert perspectives together.

## Features

- Build and manage your own expert panel.
- Ask a question of one expert or the entire panel.
- Record responses in your experts' voices and revisit them in a searchable question library.
- Filter questions by expert and answer status.
- Keep every member's experts, questions, and answers private to their signed-in account.

Answers are manually recorded in this version; the app does not generate AI responses.

## Run locally in Replit

Use the Run button to start the managed web and API services. They provide their own `PORT` and `BASE_PATH`.

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
```

The Replit-managed Clerk keys are stored in Secrets. The development PostgreSQL database is provisioned by Replit; schema changes are applied with:

```sh
pnpm --filter @workspace/db run push
```

## Workspace map

- `artifacts/panel-of-experts` — React/Vite website and member pages.
- `artifacts/api-server` — Express API, authentication middleware, and routes.
- `lib/api-spec/openapi.yaml` — API contract source of truth.
- `lib/api-client-react` — generated React Query hooks.
- `lib/api-zod` — generated request and response validation schemas.
- `lib/db/src/schema` — Drizzle PostgreSQL schema.

See [replit.md](./replit.md) for run commands, routes, environment details, and architecture notes.
