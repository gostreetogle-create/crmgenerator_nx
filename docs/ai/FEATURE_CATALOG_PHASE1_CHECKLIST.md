# Чек-лист: фаза 1 каталога (категории, материалы, типы деталей)

**Норматив паттерна:** `docs/ai/FEATURE_WITH_API_PATTERN.md`  
**Контракт:** `docs/api/FRONTEND_CONTRACT.md` + `libs/domain`  
**БЛ:** `docs/business/BL_PAGES_AND_DATA_MODEL.md` (фаза 1)

## Сделано

- [x] `Category`, `Material`, `PartType` в `@domain`
- [x] `CategoriesApiService`, `MaterialsApiService`, `PartTypesApiService` + экспорт `core/api`
- [x] `CategoriesService`, `MaterialsService`, `PartTypesService` (LS, remote, баннеры на страницах)
- [x] Страницы `/catalog/categories`, `/catalog/materials`, `/catalog/part-types` + `CatalogShellComponent`
- [x] Навигация в шапке приложения
- [x] Тесты сервисов (категории — полный цикл local; материалы/типы — remote success/fail)
- [x] Разделы в `FRONTEND_CONTRACT.md`

## Бэкенд

- [ ] Реализовать REST под путями из контракта (`GET/POST/PATCH/DELETE` для трёх ресурсов)
- [ ] Импорт Excel из `API_FUTURE_CHECKLIST.md` — по отдельному согласованию

## Следующий шаг (фаза 2)

- Товары (`Product`) и спецификации (`ProductSpecification`) — см. бизнес-док и backlog.
