# Eve-BE — Security (SEC)

Поверхность отдачи наружу: CORS, размер тела, секреты из env, безопасный формат ошибок (без утечки stack).

## Порядок работы

Перед изменением CORS, лимитов body, env, обработки ошибок — **`grep Eve-BE: SEC-`** / **`ERROR-HANDLER`**.

## Таблица

| Артикул | Название | Описание | Файлы | Docs-link |
|---------|----------|----------|-------|-----------|
| **SEC-CORS-004** | CORS + JSON + static | `cors` по `config.corsOrigin`, `express.json({ limit })`, раздача PDF из `storage/pdfs`. | `backend/src/app.ts` | `backend/src/config.ts` (**SEC-ENV-005**); [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **SEC-ENV-005** | Переменные окружения | Загрузка `.env*` / `DATABASE_URL`, `CORS_ORIGIN`, без хардкода секретов в репозитории. | `backend/src/config.ts` | `.gitignore` для `.env` |
| **ERROR-HANDLER-003** | Ошибки и 404 | `HttpError` → статус + message; Zod → 400 + flatten; **500 без stack** в ответе; внутренняя диагностика через `console.error`. | `backend/src/middlewares/errorHandler.ts`; `backend/src/errors/HttpError.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) (формат ошибок) |

---

**Синхронизация:** [`EVE_BACKEND_INDEX.md`](./EVE_BACKEND_INDEX.md) · [`EVE_BE_API.md`](./EVE_BE_API.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md)
