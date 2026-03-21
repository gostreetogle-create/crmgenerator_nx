# AI External Review Scenario: Deployment and Update Strategy

## Purpose

This file is a complete brief for an external AI assistant that has zero knowledge of this project.
Use it to request an independent review of deployment strategy, update speed, and operational trade-offs.

---

## Project Snapshot (what this repository is)

- Monorepo based on Nx.
- Frontend: Angular app (`apps/web`).
- Backend: Node.js + Express + Prisma (`backend`).
- Database: PostgreSQL.
- Current local development setup:
  - Frontend via Nx serve/build.
  - Backend via `npm run dev` in `backend`.
  - DB can run via Docker (`backend/docker-compose.yml`), PostgreSQL exposed as `localhost:5433`.

---

## Current State (important facts)

1. The project has documentation governance and checklists in `docs/`.
2. CI checks were added for docs quality and process consistency:
   - docs-gate (requires docs update when code changes),
   - docs-links (link checker for docs markdown).
3. There is a local DB compose for development in `backend/docker-compose.yml` (PostgreSQL on `5433`).
4. A production-like deployment pack is already present in `deploy/`:
   - `deploy/Dockerfile.backend`
   - `deploy/Dockerfile.web`
   - `deploy/docker-compose.yml`
   - `deploy/deploy.sh`
   - `deploy/.env.example`
   - `deploy/README.md`
5. Deployment script is SSH-friendly and intended for one-command updates (`./deploy.sh`).
6. Product specification endpoints were recently implemented in backend:
   - `/api/products/:productId/specifications` CRUD.
7. Runtime smoke for product specifications passed after starting PostgreSQL in Docker.

---

## Mission

We want a deployment approach for Ubuntu servers that is:

- fast to deploy initially,
- fast to update frequently,
- safe for schema/data changes,
- easy to operate through SSH,
- reproducible for new servers,
- friendly for frequent feature additions.

---

## Main Question to Analyze

Given this project is now packaged with Docker deploy scripts, how can we keep day-to-day feature delivery fast, safe, and simple for a small team?

We need a practical strategy for frequent updates with minimal operational friction.

---

## Constraints and Preferences

- Ubuntu target server.
- SSH-based operations are acceptable and expected.
- Team wants standardized, template-like process ("almost automatic").
- Frequent code changes are expected.
- Minimize manual steps during deploy.
- Keep rollback straightforward.
- Avoid brittle "hero-only" ops knowledge.

---

## What You (external AI) Should Deliver

Please provide:

1. **Architecture options** for deployment (at least 2), for example:
   - build on server (`docker compose up --build`),
   - build in CI and pull tagged images on server,
   - hybrid approach.
2. **Pros/cons table** for each option:
   - setup complexity,
   - deploy speed,
   - rollback speed,
   - risk profile,
   - cost profile,
   - team skill dependency.
3. **Recommended target approach** (single preferred option) with clear reasoning.
4. **Step-by-step rollout plan** for this repository from current state to target state.
5. **Fast update workflow** for frequent feature releases:
   - pre-deploy checks,
   - migration order,
   - restart order,
   - post-deploy smoke.
6. **Rollback workflow**:
   - when and how to rollback app only,
   - when DB rollback is needed,
   - risk notes.
7. **SSH operational playbook**:
   - first-time server bootstrap,
   - normal deploy,
   - emergency rollback,
   - health diagnostics.
8. **Automation checklist**:
   - scripts/files to add to repo,
   - CI jobs to add,
   - secrets/env management recommendations.
9. **Gap analysis of existing `deploy/`**:
   - what is already good,
   - what is risky,
   - what should be improved first without overengineering.

---

## Repository Paths You Can Reference

- `apps/web`
- `backend`
- `backend/docker-compose.yml`
- `deploy/docker-compose.yml`
- `deploy/deploy.sh`
- `deploy/Dockerfile.backend`
- `deploy/Dockerfile.web`
- `deploy/README.md`
- `deploy/.env.example`
- `docs/START_HERE.md`
- `docs/ai/DOCS_SYNC_RULES.md`
- `docs/ai/FEATURE_SYSTEM_AUDIT_CHECKLIST.md`
- `docs/ai/FEATURE_PRODUCT_SPECIFICATIONS_PHASE3_CHECKLIST.md`

---

## Required Output Format (strict)

Return your answer in this order:

1. Executive recommendation (5-10 lines).
2. Option comparison table.
3. Chosen architecture deep dive.
4. Incremental implementation plan (Week 1 / Week 2 style).
5. SSH command cookbook.
6. Risks and mitigations.
7. "First 3 actions we should do tomorrow morning."

---

## Notes

- Do not assume hidden infra.
- If you propose cloud-managed services, include a self-hosted alternative.
- Keep recommendations realistic for a small team with fast iteration needs.

---

## TypeScript Strict Mode: Правила и фиксы

Цель: сохранить `strict: true` и `noImplicitAny: true` в backend без временных "костылей".

### 1) Базовые правила типизации контроллеров

- Каждый handler явно типизировать:
  - `req: Request`
  - `res: Response`
- Для транзакций Prisma использовать `Prisma.TransactionClient`.
- Не оставлять параметры без типа (это приводит к `TS7006`).

Шаблон:

```ts
import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';

export async function myHandler(req: Request, res: Response) {
  return res.json({ ok: true });
}

async function runInTx(tx: Prisma.TransactionClient) {
  // tx.product.findMany(...)
}
```

### 2) Prisma Client и Docker build (против `TS2305`)

Проблема `TS2305` часто означает, что Prisma Client не сгенерирован под актуальную `schema.prisma`.

Рекомендация для Dockerfile backend:

1. Скопировать `backend/prisma/` в image до шага build.
2. Выполнить `npx prisma generate`.
3. Только потом запускать `npm run build`.

Порядок (пример):

```dockerfile
COPY backend/prisma ./prisma
RUN npx prisma generate
RUN npm run build
```

### 3) Почему нельзя оставлять `any`

- `any` скрывает ошибки на этапе компиляции.
- В strict-проекте это разрушает предсказуемость API и усложняет рефакторинг.
- При code review `any` считать техническим долгом, который требует отдельного обоснования.

### 4) Быстрый способ чинить `TS7006`

1. Найти параметр без типа.
2. Добавить минимально точный тип (`Request`, `Response`, `string`, `number`, `Prisma.TransactionClient` и т.д.).
3. Если тип пока неизвестен — использовать `unknown`, затем сузить через проверки/валидацию.

### 5) Временное ослабление правил (только как исключение)

- `noImplicitAny` не выключать глобально.
- Допускается только краткоживущий workaround в отдельной ветке с явной задачей на удаление.
- В PR обязательно указывать причину, scope и срок снятия временного решения.
