# Контракт API — **внедрено во фронте** (истина)

**Назначение:** зафиксировано то, что **уже есть** в репозитории: модели в `libs/domain`, вызовы в `apps/web/src/app/core/api/*-api.service.ts`, поведение UI (`localStorage` до включения API). При изменении кода или договорённостей с бэком — **обновляйте этот файл**.

**Черновики и идеи на потом** (импорт Excel, загрузки, товары, КП и т.д.) — только в **`docs/api/API_FUTURE_CHECKLIST.md`**. Там же правило: **перед внедрением уточнять поля и ответы API**.

---

**Связанные источники:**
| Что | Где |
|-----|-----|
| Модели и поля | `libs/domain/src/lib/**` |
| HTTP сейчас | `OrganizationsApiService`, `ClientsApiService`, `CategoriesApiService`, `MaterialsApiService`, `PartTypesApiService`, `ProductsApiService` — **CRUD** в UI. `ProductSpecificationsApiService` — каркас в `core/api` **без вызовов из фич** (страница спецификаций отключена). |
| UI без бэка | `localStorage` + `*Service` в фичах; при `apiBaseUrl === ''` запросы к API не идут |
| Бизнес-логика и план страниц | `docs/business/BL_PAGES_AND_DATA_MODEL.md`, `docs/business/BUSINESS_LOGIC.md` |

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

## Категории товаров (`Category`)

**Модель:** `libs/domain/src/lib/categories/category.model.ts`  
**HTTP:** `categories-api.service.ts`  
**UI:** `/catalog/categories` — `CategoriesService`, `CategoriesPageComponent`

| Метод | Путь | Назначение |
|--------|------|------------|
| `GET` | `/categories` | Список |
| `GET` | `/categories/:id` | Одна запись |
| `POST` | `/categories` | Создание |
| `PATCH` | `/categories/:id` | Обновление |
| `DELETE` | `/categories/:id` | Удаление |

### Поля JSON

Обязательное в UI: **`name`**.

| Поле | Тип | Смысл |
|------|-----|--------|
| `_id` | string | Id |
| `name` | string | Название |
| `parentId` | string | Родительская категория (опц.) |
| `sortOrder` | number | Порядок сортировки |
| `isActive` | boolean | Активна в справочнике |

**Локально:** ключ LS `crmgenerator_nx_categories_v1`.

---

## Материалы (`Material`)

**Модель:** `libs/domain/src/lib/materials/material.model.ts`  
**HTTP:** `materials-api.service.ts`  
**UI:** `/catalog/materials`

| Метод | Путь | Назначение |
|--------|------|------------|
| `GET` | `/materials` | Список |
| `GET` | `/materials/:id` | Одна запись |
| `POST` | `/materials` | Создание |
| `PATCH` | `/materials/:id` | Обновление |
| `DELETE` | `/materials/:id` | Удаление |

### Поля JSON

Обязательное в UI: **`name`**.

| Поле | Тип | Смысл |
|------|-----|--------|
| `_id` | string | Id |
| `name` | string | Название |
| `code` | string | Код / артикул материала |
| `notes` | string | Заметки |
| `isActive` | boolean | Активен |

**Локально:** ключ LS `crmgenerator_nx_materials_v1`.

---

## Типы деталей (`PartType`)

**Модель:** `libs/domain/src/lib/part-types/part-type.model.ts`  
**HTTP:** `part-types-api.service.ts`  
**UI:** `/catalog/part-types`

| Метод | Путь | Назначение |
|--------|------|------------|
| `GET` | `/part-types` | Список |
| `GET` | `/part-types/:id` | Одна запись |
| `POST` | `/part-types` | Создание |
| `PATCH` | `/part-types/:id` | Обновление |
| `DELETE` | `/part-types/:id` | Удаление |

### Поля JSON

Обязательное в UI: **`name`**.

| Поле | Тип | Смысл |
|------|-----|--------|
| `_id` | string | Id |
| `name` | string | Название типа |
| `description` | string | Техописание / параметры |
| `isActive` | boolean | Активен |

**Локально:** ключ LS `crmgenerator_nx_part_types_v1`.

---

## Товары (`Product`)

**Модель:** `libs/domain/src/lib/products/product.model.ts`  
**HTTP:** `products-api.service.ts`  
**Справочники в формах:** `CatalogLookupService` (`core/catalog`) — те же данные, что фаза 1 (LS или `getAll` при remote).  
**UI:** `/catalog/products` — `ProductsService`, `ProductsPageComponent` (сетка: категории | товары | типы деталей | материалы; клик по строке товара сужает боковые колонки; повторный клик по той же строке или клик вне неё — полные списки).

| Метод | Путь | Назначение |
|--------|------|------------|
| `GET` | `/products` | Список |
| `GET` | `/products/search?q=` | Поиск (опционально для бэка; UI пока фильтрует локально) |
| `GET` | `/products/:id` | Одна запись |
| `POST` | `/products` | Создание |
| `PATCH` | `/products/:id` | Обновление |
| `DELETE` | `/products/:id` | Удаление |

### Поля JSON

Обязательное в UI: **`name`**, **`categoryId`**. Быстрое создание категории / типа детали / материала из формы товара: `*ForPicker` в сервисах справочников + `CatalogLookupService.applyFromSignals`.

| Поле | Тип | Смысл |
|------|-----|--------|
| `_id` | string | Id |
| `name` | string | Название |
| `sku` | string | Код / SKU |
| `categoryId` | string | Ссылка на `Category` (обязательно в UI) |
| `partTypeId` | string | Тип детали / тех. описание (опц.) |
| `materialId` | string | Материал к карточке товара (опц.) |
| `notes` | string | Заметки |
| `isActive` | boolean | Активен |

**Локально:** ключ LS `crmgenerator_nx_products_v1`.

---

## Заказы (`Order`) — API есть, UI пока нет

Модель: `libs/domain/src/lib/orders/order.model.ts`

В бэке уже реализовано:

| Метод | Путь | Назначение |
|--------|------|------------|
| `GET` | `/orders` | Список заказов |
| `GET` | `/orders/:id` | Детали заказа (строки + комплектации) |

### `GET /orders` — поля JSON

| Поле | Тип | Смысл |
|------|-----|--------|
| `_id` | string | Id заказа |
| `number` | string | Номер заказа |
| `status` | `{ key: string; name: string }` | Статус |
| `clientId` | string | Опционально |
| `organizationId` | string | Опционально |
| `createdAt`, `updatedAt` | string (ISO) | Если отдаёт бэк |

### `GET /orders/:id` — поля JSON

| Поле | Тип | Смысл |
|------|-----|--------|
| `_id` | string | Id заказа |
| `number` | string | Номер заказа |
| `status` | `{ key: string; name: string }` | Статус |
| `clientId`, `organizationId` | string | Опционально |
| `createdAt`, `updatedAt` | string (ISO) | Если отдаёт бэк |
| `sourceProposalId` | string | Корень КП (для трассировки) |
| `sourceProposalVersionId` | string | Скрытый идентификатор версии КП (для трассировки) |
| `lines` | массив `OrderLine` | Строки заказа |

`OrderLine` (в `lines[]`):

| Поле | Тип | Смысл |
|------|-----|--------|
| `_id` | string | Id строки |
| `lineNo` | number | Порядковый номер |
| `productionCode` | string | Код позиции производства (№КП-№пп) |
| `isCustom` | boolean | Custom/не каталог |
| `quantity` | number | Для производства: что и сколько создаём |
| `unit` | string | Единица измерения |
| `sourceProposalItemLineNo` | number | №пп в КП (для “кода производства”) |
| `productSnapshot` | объект | Снапшот товара (без цены) |
| `mounts` | массив | Выбранные монтажы (mountTypeId + mountTypeName) |
| `functionalities` | массив | Выбранные функциональности (functionalityId + functionalityName) |

`productSnapshot`:

| Поле | Тип | Смысл |
|------|-----|--------|
| `productName` | string | Название товара на момент фиксации |
| `productSku` | string | Опционально |
| `categoryId`, `categoryName` | string | Опционально |
| `partTypeId`, `partTypeName` | string | Опционально |
| `materialId`, `materialName` | string | Опционально |
| `productNotes` | string | Опционально |
| `productIsActive` | boolean | Опционально |

### Связка с КП (`proposal_paid`)

Бэк создаёт `Order` при переходе версии КП в `proposal_paid`.

Ответ `PATCH /proposals/:id/status` (когда `statusKey=proposal_paid`) содержит:
- `orderId` (string) — созданный `Order.id`

---

## Спецификации товара (`ProductSpecification`) — **пока без UI**

Модель в **`libs/domain`**, черновик путей в **`product-specifications-api.service.ts`** (ни одна фича не инжектит сервис). Отдельная страница `/catalog/products/:id/specifications` **удалена**; варианты на карточке товара задаются полями **`partTypeId` / `materialId`**. Когда понадобится матрица вариантов или КП — вернуть фичу и перенести таблицу эндпоинтов сюда из **`API_FUTURE_CHECKLIST.md`**.

---

## История изменений

| Дата | Что |
|------|-----|
| 2026-03-20 | Первые версии: организации, клиенты, domain, HTTP-каркас. |
| 2026-03-20 | Разделение: этот файл = только внедрённое; backlog → `API_FUTURE_CHECKLIST.md`. |
| 2026-03-20 | `OrganizationsService` / `ClientsService` переключаются на `*ApiService` при непустом `apiBaseUrl`. |
| 2026-03-20 | Remote: `listLoading` / `listLoadError` / `mutationError`, оптимистичный CRUD с откатом, кэш LS при успехе и fallback при сбое `getAll`. |
| 2026-03-20 | В «Связанные источники»: ссылки на `docs/business` (БЛ и план страниц). |
| 2026-03-20 | Фаза 1 каталога: `Category`, `Material`, `PartType` в domain; API + фичи `/catalog/*`; контракт и LS-ключи. |
| 2026-03-20 | Фаза 2 каталога: `Product`, `ProductSpecification` в domain; `ProductsApiService`, `/catalog/products`, `CatalogLookupService`. |
| 2026-03-20 | UI спецификаций товара отключён; `ProductSpecificationsApiService` остаётся каркасом под бэк. |

---

### Как вести этот документ

1. Появился новый вызов в `*ApiService` → строка в таблицу эндпоинтов + при необходимости поля.
2. Новое поле в форме → `libs/domain` + таблица полей здесь.
3. Фича из backlog готова → перенести контракт из **`API_FUTURE_CHECKLIST.md`** сюда, реализовать сервис, вычеркнуть/обновить чеклист.


---

**Синхронизация:** при правках кода по паттернам Eve-Arch обновляй связанные разделы — [../ai/DOCS_SYNC_RULES.md](../ai/DOCS_SYNC_RULES.md) · [../ai/EVE_ARCH_INDEX.md](../ai/EVE_ARCH_INDEX.md)
