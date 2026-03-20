# Playbook: как ИИ должен работать с этим репозиторием

Документ для **агентов и ассистентов** (Cursor, CI-боты). Цель — целостное внедрение фич без нарушения слоёв и без «тихих» регрессий.

---

## 0. Обязательный порядок чтения (каждая нетривиальная задача)

1. `docs/ai/ARCHITECTURE.md` — слои, импорты, запреты  
2. `docs/ai/FEATURE_CHECKLIST_BASE.md` — формат чек-листа фичи и архивация  
3. `docs/ai/AI_PROJECT_PLAYBOOK.md` (этот файл) — процесс  
4. При UI в `ui-kit`: раздел **Ui-kit component template (P4)** в `docs/ai/FEATURE_CHECKLIST_BASE.md` и **`docs/ai/UI_CATALOG_AND_DESIGN_SYSTEM.md`** (добавить/обновить демо в `features/ui-catalog/`)
5. Готовые формулировки задач: `docs/ai/PROMPTS.md`
6. Если фича со **списком + CRUD + опциональным API** — **`docs/ai/FEATURE_WITH_API_PATTERN.md`** (единый паттерн с `organizations` / `clients`).

Если задача касается **конкретной фичи** — открыть `docs/ai/FEATURE_<NAME>_CHECKLIST.md` (или создать по шаблону).

---

## 1. Принципы (нельзя нарушать без явного согласования)

| Принцип | Смысл |
|--------|--------|
| **Не ломать поведение** | Рефакторинг слоёв — поэтапно; тесты/ручная проверка сценариев MVP |
| **Один источник доменной модели** | Сущности в `libs/domain`, импорт `@domain`; в фиче допустим strangler `*.model.ts` → `export * from '@domain'` |
| **Нет feature → feature** | Фичи не импортируют друг друга |
| **Нет deep-import** | Не импортировать `libs/.../src/lib/.../file.ts`; только публичные entry (`index.ts`, алиасы в `tsconfig.base.json`) |
| **ui-kit без домена** | Компоненты `@ui-kit/*` не знают о `Client` и прочих сущностях — только generic API |
| **Документация = код** | Новый слой / правило / массовый паттерн → обновить `ARCHITECTURE.md` и при необходимости чек-лист |
| **API и бэк** | Уже внедрённое во фронте → **`docs/api/FRONTEND_CONTRACT.md`** + `libs/domain`. Идеи до согласования → **`docs/api/API_FUTURE_CHECKLIST.md`**, затем перенос в контракт |
| **Data-фича с HTTP** | Реализация строго по **`docs/ai/FEATURE_WITH_API_PATTERN.md`** (не выдумывать другой каркас без согласования) |

## 1.1. Экономия токинов (LLM) — практическое правило
Эти пункты влияют на расход токинов модели, в отличие от UI-диалогов в приложении.

- Не дублировать большие фрагменты документа/кода: запрашивать только нужные куски и отвечать кратко.
- При необходимости нескольких уточнений — задавать 1–2 вопроса за раз, а не вести длинный диалог.
- В задачах для ИИ использовать “минимально достаточные” инструкции: что именно сделать и где (путь/файл), без повторения всей архитектуры.
- Если уже есть в документах (например `docs/business/*` или `docs/api/*`), в ответе ссылаться на них, а не переписывать.
- Не считать, что “убрать лишние диалоги в UI” экономит токины: токины расходуются на текст/контекст переписки и промптов, а не на количестве UI модалок в браузере.

---

## 2. Карта слоёв (куда класть код)

| Слой | Путь | Что класть |
|------|------|------------|
| Composition | `apps/web` | `app.config`, роуты, shell, провайдеры |
| Feature | `apps/web/src/app/features/<name>/` | page (smart), form (dumb), `*.service.ts`, опционально `*.model.ts` (re-export) |
| Domain | `libs/domain/src/lib/<aggregate>/` | интерфейсы, type-only модели, чистые типы без Angular/HTTP |
| UI kit | `libs/ui-kit/src/lib/<component>/` | переиспользуемые презентационные компоненты |
| Design tokens | `libs/design-tokens` | токены и глобальные стили дизайна |
| Shared | `libs/shared` (когда появится) | pure utils, **не** бизнес-модели |
| Data-access | `apps/web/src/app/core/api` (**сейчас**) | Тонкие `*ApiService`; полный паттерн фичи — **`FEATURE_WITH_API_PATTERN.md`** |
| Data-access | `libs/data-access` (план) | Будущее вынесение, если появится несколько приложений |

**Импорты:**

- Домен: `import { X } from '@domain'`  
- UI: `import { ButtonComponent } from '@ui-kit/button'` и т.д.  
- Токены в scss: `@use "tokens";` (см. `ARCHITECTURE.md`)

---

## 3. Стандартный пайплайн: новая фича `<name>`

Выполнять **по порядку**; после каждого подпункта обновлять чек-лист.

1. **Проверка**  
   - Есть ли `docs/ai/archive/FEATURE_<NAME>_CHECKLIST.md`? Если да — новая итерация: новый активный чек-лист + ссылка в `History`.  
2. **Документ**  
   - Создать `docs/ai/FEATURE_<NAME>_CHECKLIST.md` из `FEATURE_CHECKLIST_BASE.md` (MVP, non-goals, чекбоксы).  
3. **Domain (если нужна сущность)**  
   - Добавить `libs/domain/src/lib/<aggregate>/`, экспорт через `libs/domain/src/index.ts` (не раздувать публичный API).  
3a. **Контракт API (если фича ходит на бэк)**  
   - Дописать **`docs/api/FRONTEND_CONTRACT.md`**; черновик до согласования — **`API_FUTURE_CHECKLIST.md`**.  
3b. **HTTP-слой (если как organizations/clients)**  
   - По **`FEATURE_WITH_API_PATTERN.md`**: `core/api/<entity>-api.service.ts` + экспорт в `core/api/index.ts`.  
3c. **Feature-сервис**  
   - Один в один по паттерну: сигналы состояния, local vs remote, оптимизм, кэш LS — см. эталонные `*.service.ts`.  
4. **Роутинг**  
   - Маршрут в `app.routes.ts` (и при SSR `app.routes.server.ts`, если используется).  
5. **Feature UI**  
   - `<name>-page` (баннеры из эталона, `protected` inject сервиса), при необходимости `<name>-form`.  
6. **Навигация**  
   - Ссылка в layout/header при необходимости.  
7. **Тесты**  
   - Минимум: `*.service.spec.ts` с моком `*ApiService`; для data-фичи — сценарии из **`FEATURE_WITH_API_PATTERN.md`**; не ломать `nx test web`.  
8. **Проверки**  
   - `npm run ui:lint` или `nx lint web` + `nx lint domain` при изменении domain  
   - `nx build web`  
   - **Визуально:** если добавлена форма/модалка с `ViewEncapsulation.None`, открыть в браузере **существующую** фичу (например `/clients`) и новую — нет ли «перетирания» стилей из-за общих классов в глобальном CSS (см. `ARCHITECTURE.md` → «Стили форм в features»).  
  - **Модалка с многими разделами:** следовать `ARCHITECTURE.md` → «Модальные окна и формы с многими разделами»; эталон — форма организации (`organization-form`).
  - Если это тяжелая форма, правило строгое: **делать как в organizations** (та же модель вкладок и фиксированной геометрии), без альтернативных UX-веток.
  - **Каскад модалок (`+` поверх родителя):** проверить сценарий `родитель` -> `+` -> `Сохранить` во вложенной форме. Ожидание: закрывается только верхний слой; родитель не закрывается от вложенного submit.
  - **Submit во вложенной модалке:** по умолчанию использовать нативный `(submit)` с `preventDefault/stopPropagation`; не полагаться на `(ngSubmit)` в standalone-форме без явного и проверенного `FormsModule`.
9. **Чек-лист**  
   - Закрыть пункты, `History`, при готовности MVP — архивация по `FEATURE_CHECKLIST_BASE.md`.  

---

## 4. Стандартный пайплайн: новый компонент `ui-kit`

1. Прочитать раздел **Ui-kit component template (P4)** в `FEATURE_CHECKLIST_BASE.md`.  
2. `nx g @nx/angular:component --project=ui-kit ...` (standalone, scss).  
3. `ViewEncapsulation.None`, классы на элементе, токены в scss.  
4. Экспорт из `libs/ui-kit/src/index.ts` и `lib/<name>/index.ts`.  
5. Добавить пример в **Component Catalog** (`ui-catalog`), если компонент публичный.  
6. `npm run ui:lint`.

---

## 5. Антипаттерны (остановиться и переспроектировать)

- Дублировать интерфейс сущности в фиче и в `shared` вместо `@domain`  
- Вызывать `HttpClient` из компонента вместо **`core/api/*ApiService`** + feature `*Service` (см. **`FEATURE_WITH_API_PATTERN.md`**)
- Делать data-фичу с бэком **иначе**, чем в **`FEATURE_WITH_API_PATTERN.md`**, без явного согласования в `ARCHITECTURE` / чек-листе  
- Импортировать `Router` или фичевый сервис внутри `ui-kit`  
- Добавлять в `@domain` Angular decorators, `inject()`, компоненты  
- Пропускать обновление чек-листа после изменения кода фичи  
- В SCSS формы фичи при `ViewEncapsulation.None` писать селекторы вроде `.field`, `.notes-area` без уникального корневого класса — это **глобальный CSS**, который ломает другие экраны с теми же классами  

---

## 6. Команды верификации (копировать в ответ пользователю)

```bash
npm run ui:lint
npx nx build web --configuration development
npx nx test web
npx nx lint domain   # если менялся libs/domain
```

---

## 7. Связанные файлы

| Файл | Назначение |
|------|------------|
| `docs/ai/PROMPTS.md` | Готовые промпты под вставку в чат |
| `docs/ai/FEATURE_CHECKLIST_BASE.md` | Шаблон состояния фичи |
| `docs/ai/ARCHITECTURE.md` | Норматив по архитектуре |
| `docs/ai/FEATURE_WITH_API_PATTERN.md` | Эталон CRUD + optional HTTP (как organizations/clients) |
| `tsconfig.base.json` | Алиасы `@domain`, `@ui-kit/*`, … |

---

**Синхронизация:** при правках кода по паттернам Eve-Arch обновляй связанные разделы — [`DOCS_SYNC_RULES.md`](./DOCS_SYNC_RULES.md) · [`EVE_ARCH_INDEX.md`](./EVE_ARCH_INDEX.md)
