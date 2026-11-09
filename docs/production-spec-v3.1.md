# Panel of Experts — Production Spec (v3.1)

**Project:** My Panel of Experts website
**Repo:** `398451-cpu/my-panel-of-experts-website-`
**Stack:** pnpm workspaces, Node.js 24, TypeScript 5.9, Express 5, PostgreSQL + Drizzle ORM, Zod, React frontend
**Total estimated effort:** ~18 hours across Phases 0–6

---

## §1 — Product Overview

A web app where the user assembles a personal "panel of experts": profiles of specialists (e.g., nutrition, fitness, study skills, career) that answer questions and give advice. The user manages the panel, asks questions, and receives structured, expert-style answers organized per panelist and topic.

## §2 — Core Features

1. **Panel management** — create, edit, delete expert profiles (name, specialty, bio, tone/avatar).
2. **Ask the panel** — submit a question and choose one expert or the whole panel.
3. **Answer feed** — threaded list of questions and answers, filterable by expert and topic.
4. **Expert detail page** — profile with their past answers.
5. **Search** — full-text search over questions and answers.
6. **Auth (optional in v1)** — simple login so a panel is tied to a user.

## §3 — Data Model (Drizzle)

- `experts` — id, name, specialty, bio, avatar_url, tone, created_at, updated_at
- `questions` — id, expert_id (nullable = whole panel), body, topic, created_at
- `answers` — id, question_id, expert_id, body, created_at

## §4 — API Surface (OpenAPI + Orval codegen)

- `GET /experts`, `POST /experts`, `PATCH /experts/:id`, `DELETE /experts/:id`
- `GET /questions`, `POST /questions`
- `GET /questions/:id/answers`, `POST /questions/:id/answers`
- `GET /search?q=`
- All inputs validated with Zod; contracts defined in `lib/api-spec` and generated with Orval.

## §5 — Frontend (React)

- Located in `artifacts/panel-of-experts`.
- Pages: Dashboard (panel overview), Ask, Question feed, Expert profile.
- Uses generated API hooks from `lib/api-client-react`.

## §6 — Non-Functional Requirements

- Typecheck clean (`pnpm run typecheck`) on every push to main.
- API responses < 300 ms p95 for read endpoints.
- No secrets in repo; `DATABASE_URL` from env only.
- Mobile-responsive layout.

## §7 — Environments & Deployment

- Dev: `pnpm --filter @workspace/api-server run dev` (port 5000).
- DB: Postgres via `DATABASE_URL`; schema pushed with `pnpm --filter @workspace/db run push`.
- Prod target: single Node service + managed Postgres.

## §8 — Risks

- Answer generation depends on an external AI service (cost/rate limits) — v1 can use manual/stored answers.
- Search scope creep — keep v1 to DB `ILIKE` search, no external index.

## §9 — Open Questions

- Is AI-generated answering in scope for v1, or manual answers only?
- Auth needed at launch?

---

## §10 — Build Phases

### Phase 0 — Foundation & Tooling (~1.5h)
**Goal:** Repo builds and typechecks cleanly.
**Tasks:** Verify pnpm workspace scripts; wire `typecheck` to CI-style check; confirm DB connection env; write this spec into `docs/`.
**Deliverables:** Clean `pnpm run build` on main; spec committed.
**Exit gate:** Build + typecheck pass on main.

### Phase 1 — Database Schema (~2h)
**Goal:** Drizzle schema for experts/questions/answers, pushed to Postgres.
**Tasks:** Define tables in `lib/db`; `drizzle-zod` schemas; push script works.
**Deliverables:** Migrated dev DB, exported schema types.
**Exit gate:** `pnpm --filter @workspace/db run push` succeeds; types exported.

### Phase 2 — API Contracts (~2.5h)
**Goal:** OpenAPI spec in `lib/api-spec` for all endpoints.
**Tasks:** Write spec; regenerate hooks/schemas with Orval.
**Deliverables:** Generated client hooks in `lib/api-client-react`, Zod schemas in `lib/api-zod`.
**Exit gate:** `pnpm --filter @workspace/api-spec run codegen` regenerates without errors.

### Phase 3 — API Server (~3h)
**Goal:** Express 5 server implementing all endpoints with Zod validation.
**Tasks:** CRUD for experts; questions; answers; search; error handling.
**Deliverables:** Working API on port 5000.
**Exit gate:** All endpoints respond correctly (manual or scripted smoke test).

### Phase 4 — Frontend UI (~4h)
**Goal:** React pages: Dashboard, Ask, Feed, Expert profile.
**Tasks:** Wire generated hooks; forms with validation; responsive layout.
**Deliverables:** Usable app against the local API.
**Exit gate:** All four pages work end-to-end locally.

### Phase 5 — Polish & Search (~2.5h)
**Goal:** Search, empty states, loading states, error states.
**Tasks:** `ILIKE` search endpoint wired to UI; consistent styling.
**Deliverables:** Finished user flows.
**Exit gate:** QA gates §11 pass on happy paths.

### Phase 6 — Deploy & Docs (~2.5h)
**Goal:** Production deployment + final docs.
**Tasks:** Production build config; deploy; update `replit.md` "Where things live" and README.
**Deliverables:** Live site URL.
**Exit gate:** Definition of Done (§11) fully checked.

---

## §11 — QA Gates & Definition of Done

### 8 Deployment QA Gates
1. `pnpm run build` passes clean.
2. `pnpm run typecheck` passes with zero errors.
3. DB push succeeds against the production database.
4. All API endpoints return expected status codes (smoke test).
5. Frontend loads and renders all four pages.
6. Create → ask → answer flow works end-to-end.
7. No secrets committed; env vars documented.
8. Mobile viewport renders correctly (375 px width).

### Definition of Done (7 items)
1. All Phase 0–6 exit gates met.
2. All 8 QA gates pass.
3. README documents setup and run instructions.
4. `replit.md` updated with repo map and architecture notes.
5. Spec updated to match what was actually built.
6. All branches merged to main via PR.
7. Production URL verified working.
