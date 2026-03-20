# Eve-Backend Index — оглавление

Реестр паттернов **backend** (`backend/src/`, Prisma): API, безопасность, логирование. Маркеры в коде: **`// Eve-BE: <КАТЕГОРИЯ>-<ТЕМА>-NNN — кратко`**.

## Зоны скана

| Зона | Путь в репозитории |
|------|-------------------|
| Controllers | `backend/src/controllers/` |
| Routes | `backend/src/routes/` (монтирование в `api.ts`) |
| Services | `backend/src/services/` |
| Middlewares | `backend/src/middlewares/` |
| Models (схема БД) | `backend/prisma/schema.prisma` |
| Утилиты API | `backend/src/utils/` (`responseMappers`, `asyncHandler`, …) |

*Точка входа приложения (`app.ts`, `server.ts`, `config.ts`, `seed.ts`, `errors/`) помечена маркерами SEC / LOG / ERROR и учтена в таблицах ниже.*

## Подфайлы

| Раздел | Файл | Сфера |
|--------|------|--------|
| **API** | [`EVE_BE_API.md`](./EVE_BE_API.md) | Роутинг, контроллеры, валидация, маппинг ответов |
| **SEC** | [`EVE_BE_SEC.md`](./EVE_BE_SEC.md) | CORS, body limits, env, формат ошибок клиенту |
| **LOG** | [`EVE_BE_LOG.md`](./EVE_BE_LOG.md) | Старт процесса, Prisma `log`, фоновые задачи |

## Порядок работы

1. **`grep Eve-BE`** по `backend/`.
2. Подходит артикул — расширь таблицу в нужном `EVE_BE_*.md` (колонка «Файлы»).
3. Новый поток — новая строка в таблице + **`// Eve-BE: …`** в затронутом файле.
4. После смены контракта эндпоинта — **`docs/api/FRONTEND_CONTRACT.md`** и при необходимости фронт `core/api`.

## Сводка артикулов (20)

| Артикул | Раздел | Файл-индекс |
|---------|--------|-------------|
| API-MOUNT-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-VALID-ZOD-002 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-MAP-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-UTIL-002 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-CRUD-CLIENT-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-CRUD-ORG-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-CRUD-CATEGORY-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-CRUD-MATERIAL-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-CRUD-PARTTYPE-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-CRUD-MOUNTTYPE-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-CRUD-FUNCTIONALITY-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-CRUD-ORDER-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-CRUD-PRODUCT-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-PRODUCT-ATTACH-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-CRUD-PROPOSAL-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| API-PDF-GEN-001 | API | [`EVE_BE_API.md`](./EVE_BE_API.md) |
| ERROR-HANDLER-003 | SEC | [`EVE_BE_SEC.md`](./EVE_BE_SEC.md) |
| SEC-CORS-004 | SEC | [`EVE_BE_SEC.md`](./EVE_BE_SEC.md) |
| SEC-ENV-005 | SEC | [`EVE_BE_SEC.md`](./EVE_BE_SEC.md) |
| LOG-ERROR-005 | LOG | [`EVE_BE_LOG.md`](./EVE_BE_LOG.md) |

### Было → стало (для миграции ссылок)

| Старый артикул | Новый |
|----------------|--------|
| API-PRODUCTS-001 | **API-CRUD-PRODUCT-001** |
| API-PROPOSALS-001 | **API-CRUD-PROPOSAL-001** |
| SEC-CORS-BODY-001 | **SEC-CORS-004** |
| SEC-ENV-001 | **SEC-ENV-005** |
| SEC-HTTP-JSON-001 | **ERROR-HANDLER-003** |
| LOG-BOOT-001 | **LOG-ERROR-005** |

---

**Синхронизация:** [`DOCS_SYNC_RULES.md`](./DOCS_SYNC_RULES.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) (раздел Backend)
