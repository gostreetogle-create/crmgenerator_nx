# Промпты для ИИ (копируй в чат и подставляй плейсхолдеры)

> **Канонический файл:** `docs/ai/PROMPTS.md` (единственная копия в репозитории).

Замени `<FEATURE>`, `<Entity>`, `<route>` и т.д. на реальные значения (латиница, kebab-case для имён файлов/роутов где уместно).

---

## P1 — Полная новая фича (скелет + документы)

```text
Ты работаешь в Nx + Angular монорепо crmgenerator_nx. Соблюдай docs/ai/ARCHITECTURE.md и docs/ai/AI_PROJECT_PLAYBOOK.md.

Задача: ввести фичу "<FEATURE>" с MVP: <опиши 3–5 пользовательских действий>.

Обязательно:
1. Проверь docs/ai/archive/ на дубликат FEATURE_<FEATURE>_CHECKLIST; если архив есть — новая итерация со ссылкой в History.
2. Создай docs/ai/FEATURE_<FEATURE>_CHECKLIST.md по шаблону FEATURE_CHECKLIST_BASE.md (Summary, Links, MVP, Non-goals, чекбоксы).
3. Если нужна доменная сущность — добавь типы в libs/domain/src/lib/<aggregate>/ и экспорт в libs/domain/src/index.ts; импорт в фиче через @domain; при необходимости strangler <feature>.model.ts с export * from '@domain'.
4. Добавь маршрут в app.routes.ts (и server routes если нужно).
5. Создай apps/web/src/app/features/<feature>/: *-page (smart), при необходимости *-form (dumb), *.service.ts. Не импортировать другие features.
6. UI только из @ui-kit/* и design-tokens; не дублировать button/input/card/confirm-dialog в фиче.
7. Если есть *-form с ViewEncapsulation.None: в SCSS все селекторы только под уникальным корнем (.<feature>-form), без «голых» .field/.notes-area (см. ARCHITECTURE.md). В чек-листе фичи включи блок «Архитектура и стили» из FEATURE_CHECKLIST_BASE.md.
8. Если фича = список + CRUD + опциональный бэк (как organizations/clients): строго следуй docs/ai/FEATURE_WITH_API_PATTERN.md — domain, FRONTEND_CONTRACT.md, core/api/*-api.service.ts, *Service с сигналами и баннерами на странице, тесты с моком API.
9. Обнови чек-лист и в конце предложи команды: npm run ui:lint, nx build web --configuration development, nx test web.

Не меняй поведение существующих фич без запроса. Покажи список изменённых/созданных файлов.
```

---

## P2 — Только доменная модель / расширение @domain

```text
Задача: добавить в libs/domain доменную модель для сущности "<Entity>" (только TypeScript types/interfaces, без Angular и HTTP).

Требования:
- Файлы: libs/domain/src/lib/<aggregate>/ (model + index.ts), реэкспорт в libs/domain/src/index.ts.
- Не экспортировать лишнее из корня domain.
- Если фича "<FEATURE>" уже использует локальный тип — переведи на @domain и оставь optional strangler apps/web/.../<feature>.model.ts с export * from '@domain'.
- Обнови docs/ai/ARCHITECTURE.md только если меняются правила слоя domain.
- Проверка: nx lint domain, nx build web.

Покажи diff по смыслу и список файлов.
```

---

## P3 — Роут + пустая страница (заглушка)

```text
Добавь маршрут "<route>" и standalone страницу-заглушку в apps/web/src/app/features/<FEATURE>/ (только page component + минимальный шаблон с app-card из ui-kit).
Не трогай другие фичи. Зарегистрируй роут в app.routes.ts. Обнови FEATURE_<FEATURE>_CHECKLIST если файл уже есть, иначе создай краткий чек-лист с MVP "страница открывается".
```

---

## P4 — Новый компонент ui-kit + каталог

```text
Добавь в libs/ui-kit новый презентационный компонент "<Name>" по разделу «Ui-kit component template (P4)» в docs/ai/FEATURE_CHECKLIST_BASE.md и ARCHITECTURE.md:
- standalone, scss, ViewEncapsulation.None, @use "tokens";
- публичный API через libs/ui-kit/src/index.ts и lib/<name>/index.ts;
- без доменных типов и без Router/HttpClient;
- добавь демо в apps/web/src/app/features/ui-catalog/ (код артикула как у существующих групп).

Запусти линт ui-kit/web через npm run ui:lint.
```

---

## P5 — Рефакторинг без смены поведения (strangler)

```text
Перенеси <что именно> в <целевой слой libs/domain|будущий data-access> без изменения публичного поведения приложения.
Шаги маленькими коммитами: сначала добавить новый модуль и экспорты, затем переключить импорты, затем удалить дубликаты только если нет ссылок.
Сохрани временный re-export если нужен для совместимости. После каждого шага: nx build web && nx test web.
```

---

## P6 — Закрытие итерации фичи (чек-лист + архив)

```text
Фича "<FEATURE>": проверь docs/ai/FEATURE_<FEATURE>_CHECKLIST.md — все пункты MVP закрыты, нет -[!] и -[-] по MVP.
Заполни Completion & Archiving, перенеси файл в docs/ai/archive/ по правилам FEATURE_CHECKLIST_BASE.md.
Если планируется вторая волна — опиши в новом чек-листе связь с архивом в History.
```

---

## P7 — Аудит слоёв и импортов (review-only)

```text
Просканируй изменения в ветке/директории <path> на нарушения:
- feature → feature импорты
- deep-import libs/.../file.ts
- ui-kit импортирует domain/features
- дубликаты доменных моделей вне libs/domain

Выведи таблицу: нарушение | файл | строка | рекомендация. Не меняй код без явного запроса.
```

---

## P8 — Подключение HTTP (когда появится data-access)

```text
(Шаблон на будущее) Вынеси HTTP для "<FEATURE>" в libs/data-access/<feature>/:
- <feature>.dto.ts — типы ответов API
- <feature>.api.ts — методы HttpClient
- мапперы DTO → типы из @domain в отдельных pure-функциях или в api-слое без утечки DTO в компоненты

Фича использует только domain-модели и фасад-сервис; компоненты не вызывают Api напрямую.
Соблюдай provideHttpClient в app.config при первом внедрении.
```

---

## Плейсхолдеры (соглашения)

| Плейсхолдер | Пример |
|-------------|--------|
| `<FEATURE>` | `Organizations` (для чек-листа: `FEATURE_ORGANIZATIONS_CHECKLIST`) |
| `<feature>` | `organizations` (папка в features) |
| `<Entity>` | `Organization` |
| `<aggregate>` | `organizations` (папка в domain) |
| `<route>` | `organizations` |

---

**Синхронизация:** при правках кода по паттернам Eve-Arch обновляй связанные разделы — [`DOCS_SYNC_RULES.md`](./DOCS_SYNC_RULES.md) · [`EVE_ARCH_INDEX.md`](./EVE_ARCH_INDEX.md)
