# FEATURE_SYSTEM_AUDIT_CHECKLIST

## Summary

Генеральный аудит системы в 3 этапа:
1) backend, 2) frontend, 3) синхронность backend/frontend/docs.  
Цель: зафиксировать текущее здоровье системы, найти рассинхрон, сформировать и закрыть план работ по пунктам.

## Links

- `docs/START_HERE.md`
- `docs/ai/ARCHITECTURE.md`
- `docs/ai/DOCS_SYNC_RULES.md`
- `docs/api/FRONTEND_CONTRACT.md`
- `docs/api/API_FUTURE_CHECKLIST.md`

## Definition of MVP

- Выполнен технический аудит backend + frontend.
- Выполнена сверка контрактов и реальных endpoints.
- Составлен и актуализирован список задач на исправление.
- Начат проход по задачам сверху вниз (не только план, но и фактические правки).

## Non-goals

- Полный UX-регресс всех экранов в браузере за один проход.
- Рефактор больших модулей без подтвержденной необходимости.

## Implementation checklist

### Backend audit
- [x] Сборка backend проходит (`npm run build`).
- [x] Карта routes/controllers собрана и проверена на базовую целостность.
- [x] Проверен базовый health/mount app (`/api`, `/api/health`, `apiRouter`).
- [x] Проверен статус критичных каталогов API (`products`, `categories`, `materials`, `part-types`, `mount-types`, `functionalities`).

### Frontend audit
- [x] Сборка frontend проходит (`npx nx build web --configuration development`).
- [x] Проверен роутинг фич и экспорт API-слоя (`core/api/index.ts`).
- [x] Проверен `CatalogLookupService` (lookup-данные и fallback поведение).
- [x] Устранены lint-warning в тестах сервисов (`clients`, `organizations`).

### Sync audit (backend <-> frontend <-> docs)
- [x] Сверка основных CRUD endpoints между `core/api/*` и `backend/src/routes/*`.
- [x] Сверка вложенных ресурсов и отложенных API (найден gap по product specifications).
- [x] Принято решение по gap: оставить frontend API как non-runtime каркас до следующей фазы.
- [x] Обновлён docs-контракт и backlog после решения.

## Findings (текущие)

1. **Build status:** backend и frontend собираются успешно.
2. **Lint status:** warning-ы в `web` тестах устранены.
3. **Синхро-gap закрыт:** для `ProductSpecificationsApiService` реализован backend CRUD (`/products/:productId/specifications`), контракт синхронизирован; runtime smoke пройден после подъема PostgreSQL в Docker.
4. **Ручной smoke (UI):**
   - `/clients` — PASS (лист/действия видны, форма открывается и корректно закрывается).
   - `/organizations` — PASS (лист/действия видны, форма открывается и корректно закрывается).
   - `/catalog/products` — PASS (таблица и кнопки действий видны; в форме нового товара после заполнения обязательных полей кнопка `Сохранить` становится активной, dead-click не воспроизведён).

## Data/validation notes

- Для каталога и товаров текущая связка endpoint-ов и моделей консистентна.
- Для отложенных/каркасных API требуется явный статус в контракте: runtime-ready vs planned.

## Tests & QA

- [x] `backend: npm run build`
- [x] `web: npx nx build web --configuration development`
- [x] `web: npx nx lint web` (после правок тестов — без предупреждений)
- [x] `web: npx nx test web` (8 suites / 23 tests passed)
- [x] Ручной smoke по ключевым сценариям (`clients`, `organizations`, `catalog/products`)

## Risks / open questions

- Если начать использовать `ProductSpecificationsApiService` до реализации backend endpoint, UI получит runtime ошибки (404).

## History

| Дата | Что |
|------|-----|
| 2026-03-21 | Создан генеральный audit-checklist (backend -> frontend -> sync). |
| 2026-03-21 | Выполнены build-аудиты backend/web, выявлен sync-gap по `product specifications`. |
| 2026-03-21 | Начат проход по пунктам: устранены lint-warning в тестах `clients/organizations`. |
| 2026-03-21 | Зафиксирован статус `ProductSpecificationsApiService` как non-runtime; синхронизированы `FRONTEND_CONTRACT` и `API_FUTURE_CHECKLIST`. |
| 2026-03-21 | Прогнаны `nx test web`: 8 suites / 23 tests passed. |
| 2026-03-21 | Выполнен ручной smoke (`clients`, `organizations`, `catalog/products`) — критичных UI-сбоев не найдено. |

---

**Синхронизация:** при правках кода по паттернам Eve-Arch обновляй связанные разделы — [`DOCS_SYNC_RULES.md`](./DOCS_SYNC_RULES.md) · [`EVE_ARCH_INDEX.md`](./EVE_ARCH_INDEX.md)
