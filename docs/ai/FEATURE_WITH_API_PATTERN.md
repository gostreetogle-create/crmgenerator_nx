# Эталон: фича с CRUD и опциональным HTTP

**Назначение:** чтобы **все новые data-фичи** делались **однотипно** с `organizations` и `clients`: слои, сигналы, локальный fallback, документы.

**Эталонные реализации (сверяйся по коду):**

| Роль | Организации | Клиенты |
|------|-------------|---------|
| Feature-сервис | `apps/web/src/app/features/organizations/organizations.service.ts` | `.../clients/clients.service.ts` |
| API-сервис | `apps/web/src/app/core/api/organizations-api.service.ts` | `.../clients-api.service.ts` |
| Страница (баннеры) | `organizations-page.component.{ts,html,scss}` | `clients-page.component.{ts,html,scss}` |
| Тесты сервиса | `organizations.service.spec.ts` | `clients.service.spec.ts` |
| Модель | `libs/domain/src/lib/organizations/` | `libs/domain/src/lib/clients/` |

Общие утилиты: `apps/web/src/app/core/api/http-error-message.ts`, экспорт из `core/api/index.ts`.

---

## Когда применять этот паттерн

- Фича ведёт **список сущностей** с **create / update / delete** (или подмножество).
- Данные могут жить **локально** (`localStorage` + сиды) **или** на **бэке** при непустом `apiBaseUrl` в `environment`.
- Нужны **одинаковые** UX-сигналы: загрузка, ошибка списка, ошибка мутации, кэш при сбое.

Если фича **без** CRUD или **только read-only** — упрости (можно без оптимизма и без части сигналов), но **слои** (domain → `core/api` → feature service) сохраняй.

---

## Слои (строго по порядку)

```text
libs/domain              ← интерфейс сущности, публичный export в libs/domain/src/index.ts
docs/api/FRONTEND_CONTRACT.md  ← эндпоинты + поля (истина после согласования)
docs/api/API_FUTURE_CHECKLIST.md ← только до промоции в контракт
apps/web/src/app/core/api/<entity>-api.service.ts  ← тонкий HttpClient, без бизнес-логики
apps/web/src/app/features/<entity>/               ← *-page, *-form, *.service.ts
```

1. **`@domain`** — только типы, без Angular/HTTP.
2. **`XxxApiService`** — только вызовы API, пути как в `FRONTEND_CONTRACT.md`, `isRemoteEnabled()` через `APP_ENVIRONMENT`.
3. **`XxxService` (feature)** — `signal` со списком, ветвление local vs remote, **не** дублировать URL вне `XxxApiService`.

**Запрещено:** вызывать `HttpClient` из **page** или **form**; тянуть одну фичу из другой.

---

## Пошаговый чек-лист для новой сущности `<Entity>`

### A. Документы (до или вместе с кодом)

1. Согласовать поля с бэком / продуктом.
2. Добавить / обновить интерфейс в **`libs/domain`**.
3. Дописать раздел в **`docs/api/FRONTEND_CONTRACT.md`** (таблица методов + поля JSON).
4. Удалить или отметить выполненным соответствующий пункт в **`API_FUTURE_CHECKLIST.md`**.

### B. `core/api`

1. Создать **`<entity>-api.service.ts`**: `getAll`, `getById` (если нужно), `create`, `update`, `delete` — как в контракте.
2. Подключить экспорт в **`apps/web/src/app/core/api/index.ts`**.
3. В шапке файла — ссылка на `FRONTEND_CONTRACT.md` и `API_FUTURE_CHECKLIST.md`.

### C. Feature `XxxService`

Повторить структуру **`OrganizationsService` / `ClientsService`**:

| Элемент | Поведение |
|---------|-----------|
| `inject(XxxApiService)`, `inject(PLATFORM_ID)` | Обязательно |
| `readonly items = signal<...>(computeInitial())` | Начальное состояние: SSR — сиды; browser + remote — `[]` до `getAll`; browser + local — LS или сиды |
| `listLoading` | `true` на время `fetchRemoteList` |
| `listLoadError` | Текст при ошибке `getAll`; список = **fallback** `loadFromLocalStorageOrSeed()` |
| `mutationError` | Текст при ошибке create/update/delete после **отката** UI |
| `effect` → `saveToLS` | Только если **`!api.isRemoteEnabled()`** |
| Remote: `fetchRemoteList()` в конструкторе (browser) | Успех → `set(list)` + **`persistRemoteCache`** (тот же ключ LS, что и в локальном режиме) |
| Remote CRUD | **Оптимистично:** create с временным `_id` `__pending:${uuid}`; update/delete со **снимком** списка и откатом |
| Ошибки | `httpErrorMessage(err)` из `core/api` |
| Публично | `refreshFromRemote()`, `dismissListLoadError()`, `dismissMutationError()` |

Ключ **`localStorage`** уникален: `crmgenerator_nx_<entity>_v1` (или согласованный префикс).

### D. Страница (smart)

1. `protected readonly xxxService = inject(XxxService)` — чтобы шаблон видел сервис.
2. Прокинуть список: `readonly items = this.xxxService.items` (или как назвали сигнал).
3. **Баннеры** (скопировать разметку с `organizations-page` / `clients-page`):
   - пустой список + `listLoading` → текст «Загрузка…»
   - непустой список + `listLoading` → «Обновление списка…»
   - `listLoadError` → предупреждение + **Повторить** (`refreshFromRemote`) + **Скрыть**
   - `mutationError` → ошибка + **Закрыть**
4. Стили баннеров: классы `.list-state`, `.state-banner`, `.banner-dismiss` (как в эталонных `*-page.component.scss`).

### E. Тесты (`*.service.spec.ts`)

1. Мок **`XxxApiService`** с `isRemoteEnabled: () => false` для локального режима.
2. Сценарий **remote success**: `getAll` → `of([...])`, проверить список, **кэш в LS** после успеха.
3. Сценарий **remote getAll fail**: `throwError`, в LS заранее положить кэш → список из кэша + `listLoadError`.

### F. Чек-лист фичи

Создать / обновить **`docs/ai/FEATURE_<ENTITY>_CHECKLIST.md`** по **`FEATURE_CHECKLIST_BASE.md`**, явно указать:

- контракт: `FRONTEND_CONTRACT.md` + `domain`;
- персистентность: local vs remote как выше;
- ссылку на **этот файл** как на норматив паттерна.

---

## Именование

| Сущность | API-сервис | Feature-сервис | Ключ LS |
|----------|------------|----------------|---------|
| `Organization` | `OrganizationsApiService` | `OrganizationsService` | `crmgenerator_nx_organizations_v1` |
| `Client` | `ClientsApiService` | `ClientsService` | `crmgenerator_nx_clients_v1` |
| новая | `<Plural>ApiService` или `<Entity>ApiService` | `<Plural>Service` | `crmgenerator_nx_<short>_v1` |

Пути HTTP в коде — **множественное число** там, где так в контракте (`organizations`, `clients`).

---

## Чего не делать

- Не оставлять список пустым при сбое `getAll`, если есть кэш или сиды — **всегда fallback**.
- Не писать в LS при каждом изменении списка в **remote**-режиме через общий `effect` с локальной логикой — только явный **`persistRemoteCache`** после успешных ответов API.
- Не показывать сырой `__pending:` в UX без необходимости (при росте фич можно скрыть действия для pending-строк).
- Не добавлять эндпоинты только в код без строки в **`FRONTEND_CONTRACT.md`**.

---

## Связанные документы

- `docs/ai/ARCHITECTURE.md` — слои, Smart/Dumb, модалки, guardrails.
- `docs/ai/AI_PROJECT_PLAYBOOK.md` — общий пайплайн фичи.
- `docs/ai/FEATURE_CHECKLIST_BASE.md` — шаблон чек-листа + блок про data-фичи.
- `docs/api/README.md` — контракт и backlog.

---

## История

| Дата | Что |
|------|-----|
| 2026-03-20 | Первый вариант: единый паттерн CRUD + optional HTTP по organizations/clients. |
