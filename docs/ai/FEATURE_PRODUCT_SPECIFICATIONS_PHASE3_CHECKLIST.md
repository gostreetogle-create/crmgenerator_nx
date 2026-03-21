# FEATURE_PRODUCT_SPECIFICATIONS_PHASE3_CHECKLIST

## Summary

Фаза 3: довести `ProductSpecifications` из non-runtime каркаса до рабочего backend API + синхронного контракта.

## Links

- `docs/api/FRONTEND_CONTRACT.md`
- `apps/web/src/app/core/api/product-specifications-api.service.ts`
- `backend/src/routes/product-specifications.routes.ts`
- `backend/src/controllers/product-specifications.controller.ts`
- `backend/prisma/schema.prisma`

## Definition of MVP

- Backend реализует CRUD `products/:productId/specifications`.
- Frontend API-сервис работает с существующим backend путем без расхождений.
- Контракт API и backlog синхронизированы.
- Сборки/линт/тесты проходят.

## Implementation checklist

- [x] Добавить Prisma-модель `ProductSpecification` + связь с `Product`.
- [x] Реализовать backend controller CRUD для спецификаций.
- [x] Подключить backend route в `/api/products/:productId/specifications`.
- [x] Синхронизировать `FRONTEND_CONTRACT.md` (раздел ProductSpecification).
- [x] Обновить `API_FUTURE_CHECKLIST.md` (статус: внедрено).
- [x] Прогнать backend `prisma generate` + `npm run build`.
- [x] Прогнать frontend `npx nx lint web` + `npx nx test web`.
- [x] Ручной smoke: базовый CRUD спецификаций через API (postman/httpie).

## Risks / open questions

- Для уникальности пары (`partTypeId`, `materialId`) на уровне продукта пока применена проверка в controller (без DB-constraint на nullable-composite).
- Локальный API smoke вынесен в `backend/scripts/smoke-product-specifications.ps1`.

## History

| Дата | Что |
|------|-----|
| 2026-03-21 | Инициализирован чеклист фазы 3, начата реализация runtime endpoint-ов. |
| 2026-03-21 | Прогнаны проверки: `prisma generate`, `backend build`, `web lint/test` — успешно. |
| 2026-03-21 | Добавлен smoke-скрипт `backend/scripts/smoke-product-specifications.ps1`; после поднятия PostgreSQL в Docker smoke пройден (create/update/delete). |

---

**Синхронизация:** при правках кода по паттернам Eve-Arch обновляй связанные разделы — [`DOCS_SYNC_RULES.md`](./DOCS_SYNC_RULES.md) · [`EVE_ARCH_INDEX.md`](./EVE_ARCH_INDEX.md)
