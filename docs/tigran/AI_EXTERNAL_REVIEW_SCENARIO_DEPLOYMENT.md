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
3. Backend currently has Docker Compose only for PostgreSQL (`backend/docker-compose.yml`).
4. There is no full production container packaging yet for:
   - backend API runtime image,
   - frontend web runtime image,
   - unified production compose for all services.
5. Product specification endpoints were recently implemented in backend:
   - `/api/products/:productId/specifications` CRUD.
6. Runtime smoke for product specifications passed after starting PostgreSQL in Docker.

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

If this project is fully packaged (containers + scripts), how much does day-to-day feature delivery become harder or easier?

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

---

## Repository Paths You Can Reference

- `apps/web`
- `backend`
- `backend/docker-compose.yml`
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
