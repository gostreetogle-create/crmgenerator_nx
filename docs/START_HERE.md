# CRM Generator Docs — START HERE

Единая точка входа в документацию проекта (frontend + backend).

## Быстрый маршрут по задаче

1. **Архитектура и правила работы**
   - `docs/ai/ARCHITECTURE.md`
   - `docs/ai/DOCS_SYNC_RULES.md`
   - `docs/ai/AI_PROJECT_PLAYBOOK.md`

2. **Если задача по API / backend ↔ frontend контракту**
   - `docs/api/FRONTEND_CONTRACT.md` (истина по текущей реализации)
   - `docs/api/API_FUTURE_CHECKLIST.md` (только backlog)

3. **Если задача по бизнес-логике**
   - `docs/business/BL_PAGES_AND_DATA_MODEL.md`
   - `docs/business/BUSINESS_LOGIC.md`

4. **Если задача по конкретной фиче**
   - `docs/ai/FEATURE_<NAME>_CHECKLIST.md`
   - если нет: `docs/ai/FEATURE_CHECKLIST_BASE.md`

5. **Если задача по паттернам/индексам**
   - `docs/ai/EVE_ARCH_INDEX.md`
   - `docs/ai/EVE_INDEXES.md`
   - `docs/ai/EVE_BACKEND_INDEX.md`

## Маршрут по роли

- **Frontend dev / AI:** п.1 -> п.4 -> п.2 (если API)
- **Backend dev / AI:** п.2 -> п.1 -> п.3
- **Product/Analyst:** п.3 -> п.2 -> активный feature checklist

## Definition of Ready for задачу

Перед стартом убедись, что:
- понятен слой изменения (feature, ui-kit, domain, backend);
- понятен источник правды по данным (`FRONTEND_CONTRACT.md` vs backlog);
- есть активный чеклист фичи или создан из шаблона.

## Definition of Done (коротко)

- код + wiring + docs sync (`EVE_*`, `ARCHITECTURE`, checklist);
- минимум один валидирующий прогон (`build/test/smoke`);
- в отчете указаны измененные файлы и статус (полностью/частично).

---

**Синхронизация:** [`README.md`](./README.md) · [`ai/DOCS_SYNC_RULES.md`](./ai/DOCS_SYNC_RULES.md) · [`ai/EVE_INDEXES.md`](./ai/EVE_INDEXES.md)
