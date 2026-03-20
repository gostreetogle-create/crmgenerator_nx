/**
 * Продакшен-сборка.
 * `apiBaseUrl`: пусто — работа только через localStorage в feature-сервисах.
 * Задайте URL бэка (без завершающего `/`), когда API готов.
 */
// Eve-SEC: SEC-ENV-API-001 — база API из сборки, без секретов и хардкода токенов в репозитории
export const environment = {
  production: true,
  apiBaseUrl: '',
};
