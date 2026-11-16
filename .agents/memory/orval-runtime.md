---
name: Orval runtime
description: Node version required to generate this workspace’s API clients and validation schemas.
---

Run this workspace’s Orval code generation under Node.js 24. With Node.js 20.20 and Orval 8.47, generation fails with `Map.groupBy is not a function`; Node 24 resolves that runtime incompatibility.

**Why:** The installed generator uses the newer built-in collection API, so a codegen failure on Node 20 is a runtime mismatch rather than a broken OpenAPI contract.

**How to apply:** Keep the project runtime on Node 24 when running `pnpm --filter @workspace/api-spec run codegen`.
