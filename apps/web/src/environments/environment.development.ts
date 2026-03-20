/**
 * Локальная разработка (`nx serve web`).
 * Пример: `apiBaseUrl: 'http://localhost:3000/api'` — тогда HTTP-запросы пойдут на бэкенд
 * (см. `app/core/api`, `docs/api/FRONTEND_CONTRACT.md`; backlog — `docs/api/API_FUTURE_CHECKLIST.md`).
 */
// Eve-SEC: SEC-ENV-API-001 — тот же контракт env, что в production; URL задаётся локально/CI
export const environment = {
  production: false,
  apiBaseUrl: '',
};
