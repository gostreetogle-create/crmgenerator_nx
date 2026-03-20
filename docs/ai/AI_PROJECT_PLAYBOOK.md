# Playbook: как ИИ должен работать с этим репозиторием

Документ для **агентов и ассистентов** (Cursor, CI-боты). Цель — целостное внедрение фич без нарушения слоёв и без «тихих» регрессий.

---

## 0. Обязательный порядок чтения (каждая нетривиальная задача)

1. `docs/ai/ARCHITECTURE.md` — слои, импорты, запреты  
2. `docs/ai/FEATURE_CHECKLIST_BASE.md` — формат чек-листа фичи и архивация  
3. `docs/ai/AI_PROJECT_PLAYBOOK.md` (этот файл) — процесс  
4. При UI в `ui-kit`: `docs/ai/COMPONENT_TEMPLATE.md`  
5. Готовые формулировки задач: `docs/PROMPTS.md`  

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
| Data-access | `libs/data-access` (план) | HttpClient, DTO, мапперы DTO → domain |

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
4. **Роутинг**  
   - Маршрут в `app.routes.ts` (и при SSR `app.routes.server.ts`, если используется).  
5. **Feature-код**  
   - `<name>-page`, при необходимости `<name>-form`, `<name>.service.ts`.  
6. **Навигация**  
   - Ссылка в layout/header при необходимости.  
7. **Тесты**  
   - Минимум: сервис/критичная логика; не ломать существующие `nx test web`.  
8. **Проверки**  
   - `npm run ui:lint` или `nx lint web` + `nx lint domain` при изменении domain  
   - `nx build web`  
   - **Визуально:** если добавлена форма/модалка с `ViewEncapsulation.None`, открыть в браузере **существующую** фичу (например `/clients`) и новую — нет ли «перетирания» стилей из-за общих классов в глобальном CSS (см. `ARCHITECTURE.md` → «Стили форм в features»).  
9. **Чек-лист**  
   - Закрыть пункты, `History`, при готовности MVP — архивация по `FEATURE_CHECKLIST_BASE.md`.  

---

## 4. Стандартный пайплайн: новый компонент `ui-kit`

1. Прочитать `COMPONENT_TEMPLATE.md`.  
2. `nx g @nx/angular:component --project=ui-kit ...` (standalone, scss).  
3. `ViewEncapsulation.None`, классы на элементе, токены в scss.  
4. Экспорт из `libs/ui-kit/src/index.ts` и `lib/<name>/index.ts`.  
5. Добавить пример в **Component Catalog** (`ui-catalog`), если компонент публичный.  
6. `npm run ui:lint`.

---

## 5. Антипаттерны (остановиться и переспроектировать)

- Дублировать интерфейс сущности в фиче и в `shared` вместо `@domain`  
- Вызывать `HttpClient` из компонента вместо сервиса / будущего `data-access`  
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
| `docs/PROMPTS.md` | Готовые промпты под вставку в чат |
| `docs/ai/FEATURE_CHECKLIST_BASE.md` | Шаблон состояния фичи |
| `docs/ai/ARCHITECTURE.md` | Норматив по архитектуре |
| `tsconfig.base.json` | Алиасы `@domain`, `@ui-kit/*`, … |
