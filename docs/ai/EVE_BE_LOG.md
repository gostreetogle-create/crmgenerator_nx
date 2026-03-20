# Eve-BE — Logging (LOG)

Диагностика жизненного цикла процесса, БД и фоновых задач (консоль / Prisma `log`).

## Порядок работы

Расширение логирования (структурные логи, correlation id) — при необходимости новый артикул **`LOG-*`**, **`grep Eve-BE: LOG-`**.

## Таблица

| Артикул | Название | Описание | Файлы | Docs-link |
|---------|----------|----------|-------|-----------|
| **LOG-ERROR-005** | Старт, БД, фон | `listen`, `seedStatuses()`, планировщик очистки PDF; `PrismaClient` с `log: ['error']`; логи/ошибки в cleanup. | `backend/src/server.ts`; `backend/src/seed.ts`; `backend/src/services/prisma.ts`; `backend/src/utils/pdfStorageCleanup.ts` | [EVE_BE_API](./EVE_BE_API.md) (статусы proposals/orders) |

---

**Синхронизация:** [`EVE_BACKEND_INDEX.md`](./EVE_BACKEND_INDEX.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md)
