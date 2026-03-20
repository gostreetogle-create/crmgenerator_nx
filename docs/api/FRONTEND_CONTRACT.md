# Контракт API — **внедрено во фронте** (истина)

**Назначение:** зафиксировано то, что **уже есть** в репозитории: модели в `libs/domain`, вызовы в `apps/web/src/app/core/api/*-api.service.ts`, поведение UI (`localStorage` до включения API). При изменении кода или договорённостей с бэком — **обновляйте этот файл**.

**Черновики и идеи на потом** (импорт Excel, загрузки, товары, КП и т.д.) — только в **`docs/api/API_FUTURE_CHECKLIST.md`**. Там же правило: **перед внедрением уточнять поля и ответы API**.

---

**Связанные источники:**
| Что | Где |
|-----|-----|
| Модели и поля | `libs/domain/src/lib/**` |
| HTTP сейчас | `OrganizationsApiService`, `ClientsApiService` — только **CRUD** по таблицам ниже |
| UI без бэка | `localStorage` + `*Service` в фичах; при `apiBaseUrl === ''` запросы к API не идут |

> Старый `docs/Пример полей схем бд/api.ts` можно удалить после сверки с **`API_FUTURE_CHECKLIST.md`** (если нужен архив DTO — оставьте копию вне репо).

---

### Пакет для ИИ / бэка

| Приоритет | Файл | Зачем |
|-----------|------|--------|
| **1 — истина по текущему фронту** | **`docs/api/FRONTEND_CONTRACT.md`** (этот файл) | Что реально вызывается и какие поля ждёт UI. |
| **2** | **`libs/domain/src/lib/**/*.ts`** | Точные интерфейсы `Organization`, `Client`, … |
| **3** | **`apps/web/src/app/core/api/*-api.service.ts`** | Пути и методы `HttpClient`. |
| **только планирование** | **`docs/api/API_FUTURE_CHECKLIST.md`** | Идеи эндпоинтов; **не** считать согласованным контрактом до переноса сюда. |

**Промпт для ИИ:**  
«Сделай REST под текущий фронт: **`FRONTEND_CONTRACT.md`** + типы из **`libs/domain`** + пути как в **`OrganizationsApiService` / `ClientsApiService`**. Документ **`API_FUTURE_CHECKLIST.md`** использовать только как backlog, поля оттуда не выдумывать — согласовать.»

**На будущее:** `docs/api/openapi.yaml` в синхроне с этим файлом и `domain`.

---

## Включение HTTP на фронте

1. **`apps/web/src/environments/environment.development.ts`** — **`apiBaseUrl`**, например `'http://localhost:3000/api'`, без завершающего `/`.
2. Сборка **`development`**: `fileReplacements` в `apps/web/project.json`.
3. В `app.config`: `provideHttpClient(withFetch(), withInterceptors([apiBaseUrlInterceptor]))`, **`APP_ENVIRONMENT`**.
4. Относительные пути (`'organizations'`, `'clients/1'`) дополняются базой; абсолютные `http(s)://` не трогаются.
5. **`OrganizationsService` / `ClientsService`** при `isRemoteEnabled()`: загрузка списка через `*ApiService`, **оптимистичный** CRUD с откатом при ошибке; сигналы **`listLoading`**, **`listLoadError`**, **`mutationError`** + баннеры на страницах. Успешный ответ списка **пишется в LS как кэш**; при сбое `getAll` показываются данные из кэша/сида и сообщение об ошибке, кнопка **«Повторить»** вызывает `refreshFromRemote()`. Без `apiBaseUrl` — только сид + LS.

---

## Соглашения (HTTP)

- **JSON**, UTF-8.
- **`_id`**: string.
- Даты: **ISO 8601** (`createdAt`, `updatedAt`), если бэк отдаёт.
- Ошибки, auth — по мере внедрения дописывать **в этот файл**.

---

## Организации (`Organization`)

**Модель:** `libs/domain/src/lib/organizations/organization.model.ts`  
**HTTP-слой:** только методы ниже (файл `organizations-api.service.ts`).

| Метод | Путь | Назначение |
|--------|------|------------|
| `GET` | `/organizations` | Список |
| `GET` | `/organizations/:id` | Одна запись |
| `POST` | `/organizations` | Создание → тело без `_id` (или игнор `_id` на сервере) → `201` + объект |
| `PATCH` | `/organizations/:id` | Частичное обновление → `200` + объект |
| `DELETE` | `/organizations/:id` | Удаление |

### Поля JSON

Имена — **`camelCase`**, как в интерфейсе. В UI при создании обязательно **`name`**.

| Поле | Тип | Смысл (кратко) |
|------|-----|----------------|
| `_id` | string | Id (в ответах) |
| `name` | string | Краткое название |
| `fullName`, `shortName` | string | Наименования |
| `inn`, `kpp`, `ogrn`, `okpo`, `okved` | string | Реквизиты |
| `legalAddress`, `actualAddress`, `postalAddress` | string | Адреса |
| `bankName`, `bik`, `settlementAccount`, `correspondentAccount` | string | Банк |
| `phone`, `extraPhone`, `email`, `website` | string | Контакты |
| `directorFio`, `directorFioShort`, `directorPosition`, `directorActingOn` | string | Руководитель |
| `fssNumber`, `pfrNumber` | string | ФСС / ПФР |
| `logoUrl`, `signatureUrl`, `stampUrl` | string | URL или data URL |
| `notes` | string | Заметки |
| `markup` | number | Наценка, % |
| `prefix` | string | Префикс КП |
| `vatPercent` | number | НДС, % |
| `accentColor` | string | Hex, акцент для КП/PDF |
| `requisites` | string | Реквизиты текстом |
| `createdAt`, `updatedAt` | string (ISO) | Если отдаёт бэк |

**Импорт Excel, загрузка логотипа/подписи/печати** — в коде **нет**; черновик путей в **`API_FUTURE_CHECKLIST.md`**.

---

## Клиенты (`Client`)

**Модель:** `libs/domain/src/lib/clients/client.model.ts`  
**HTTP-слой:** `clients-api.service.ts`.

| Метод | Путь | Назначение |
|--------|------|------------|
| `GET` | `/clients` | Список |
| `GET` | `/clients/:id` | Одна запись |
| `POST` | `/clients` | Создание |
| `PATCH` | `/clients/:id` | Обновление |
| `DELETE` | `/clients/:id` | Удаление |

### Поля JSON

Обязательное в UI: **`name`**.

| Поле | Тип | Смысл |
|------|-----|--------|
| `_id` | string | Id |
| `name` | string | Название / ФИО |
| `inn`, `kpp` | string | Реквизиты |
| `contactPerson` | string | Контакт |
| `phone`, `email` | string | Связь |
| `requisites`, `address`, `notes` | string | Текст |
| `discount` | number | Скидка, % |
| `clientMarkup` | number | Наценка клиента, % |

**Импорт Excel** — не в `ClientsApiService`; см. **`API_FUTURE_CHECKLIST.md`**.

---

## История изменений

| Дата | Что |
|------|-----|
| 2026-03-20 | Первые версии: организации, клиенты, domain, HTTP-каркас. |
| 2026-03-20 | Разделение: этот файл = только внедрённое; backlog → `API_FUTURE_CHECKLIST.md`. |
| 2026-03-20 | `OrganizationsService` / `ClientsService` переключаются на `*ApiService` при непустом `apiBaseUrl`. |
| 2026-03-20 | Remote: `listLoading` / `listLoadError` / `mutationError`, оптимистичный CRUD с откатом, кэш LS при успехе и fallback при сбое `getAll`. |

---

### Как вести этот документ

1. Появился новый вызов в `*ApiService` → строка в таблицу эндпоинтов + при необходимости поля.
2. Новое поле в форме → `libs/domain` + таблица полей здесь.
3. Фича из backlog готова → перенести контракт из **`API_FUTURE_CHECKLIST.md`** сюда, реализовать сервис, вычеркнуть/обновить чеклист.
