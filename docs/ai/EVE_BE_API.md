# Eve-BE — API

HTTP-слой: монтирование роутов, контроллеры, zod-схемы, маппинг ответов, PDF/вложенные связи товара.

## Порядок работы

Перед новым эндпоинтом или изменением контракта — **`grep Eve-BE`** и **`EVE_BACKEND_INDEX.md`**.

## Таблица

| Артикул | Название | Описание | Файлы | Docs-link |
|---------|----------|----------|-------|-----------|
| **API-MOUNT-001** | Реестр `/api/*` | Корневой роутер и монтирование ресурсных путей. | `backend/src/routes/api.ts`; `routes/clients.routes.ts`; `routes/organizations.routes.ts`; `routes/categories.routes.ts`; `routes/materials.routes.ts`; `routes/part-types.routes.ts`; `routes/products.routes.ts`; `routes/product-attachments.routes.ts`; `routes/mount-types.routes.ts`; `routes/functionalities.routes.ts`; `routes/proposals.routes.ts`; `routes/orders.routes.ts`; `routes/pdf.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-VALID-ZOD-002** | Валидация Zod | Общий паттерн `parse` тел/параметров в контроллерах. | `backend/src/controllers/clients.controller.ts`; `organizations.controller.ts`; `categories.controller.ts`; `materials.controller.ts`; `part-types.controller.ts`; `products.controller.ts`; `product-attachments.controller.ts`; `mount-types.controller.ts`; `functionalities.controller.ts`; `proposals.controller.ts`; `orders.controller.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-MAP-001** | Модели и маппинг DTO | Prisma-схема как источник моделей; `_id`, плоские DTO для фронта. | `backend/prisma/schema.prisma`; `backend/src/utils/responseMappers.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-UTIL-002** | Утилиты маршрутов | `asyncHandler` → `catch(next)`; `getParamString` для id из `params`. | `backend/src/utils/asyncHandler.ts`; `utils/getParamString.ts` | — |
| **API-CRUD-CLIENT-001** | Клиенты CRUD | list/get/create/update/delete. | `backend/src/controllers/clients.controller.ts`; `routes/clients.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-CRUD-ORG-001** | Организации CRUD | list/get/create/update/delete. | `backend/src/controllers/organizations.controller.ts`; `routes/organizations.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-CRUD-CATEGORY-001** | Категории CRUD | list/get/create/update/delete. | `backend/src/controllers/categories.controller.ts`; `routes/categories.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-CRUD-MATERIAL-001** | Материалы CRUD | list/get/create/update/delete. | `backend/src/controllers/materials.controller.ts`; `routes/materials.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-CRUD-PARTTYPE-001** | Типы деталей CRUD | list/get/create/update/delete. | `backend/src/controllers/part-types.controller.ts`; `routes/part-types.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-CRUD-MOUNTTYPE-001** | Типы монтажа CRUD | list/get/create/update/delete. | `backend/src/controllers/mount-types.controller.ts`; `routes/mount-types.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-CRUD-FUNCTIONALITY-001** | Функциональности CRUD | list/get/create/update/delete. | `backend/src/controllers/functionalities.controller.ts`; `routes/functionalities.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-CRUD-ORDER-001** | Заказы | list/get, смена статуса. | `backend/src/controllers/orders.controller.ts`; `routes/orders.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-CRUD-PRODUCT-001** | Товары | list/search/CRUD, **clone** (mounts/functionalities). | `backend/src/controllers/products.controller.ts`; `routes/products.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-PRODUCT-ATTACH-001** | Связи товара | Mounts / functionalities у продукта (set-операции). | `backend/src/controllers/product-attachments.controller.ts`; `routes/product-attachments.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **API-CRUD-PROPOSAL-001** | КП (proposals) | Версии, статусы, массив позиций `items[]`. | `backend/src/controllers/proposals.controller.ts`; `routes/proposals.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md); [BL model](../business/BL_PAGES_AND_DATA_MODEL.md) |
| **API-PDF-GEN-001** | PDF по КП | Очередь/статус генерации PDF (без zod в маркере). | `backend/src/controllers/pdf.controller.ts`; `routes/pdf.routes.ts` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |

---

**Синхронизация:** [`EVE_BACKEND_INDEX.md`](./EVE_BACKEND_INDEX.md) · [`EVE_BE_SEC.md`](./EVE_BE_SEC.md) (ошибки клиенту) · [`ARCHITECTURE.md`](./ARCHITECTURE.md)
