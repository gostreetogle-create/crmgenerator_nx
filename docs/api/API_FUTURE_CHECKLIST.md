# API: чеклист и дорожная карта (**ещё не внедрено**)

> ## Обязательно перед внедрением любой строки из этого файла
>
> 1. **Согласовать с бэком / продуктом:** поля DTO, обязательность, формат ответа (особенно `multipart`, импорт, списки с пагинацией).
> 2. **Зафиксировать истину** в **`docs/api/FRONTEND_CONTRACT.md`** и при необходимости в **`libs/domain`**.
> 3. **Добавить** методы в `apps/web/src/app/core/api/*-api.service.ts` (или отдельный сервис фичи).
> 4. **Удалить или пометить выполненным** соответствующий пункт здесь.

Этот файл — **черновик и памятка** (в т.ч. из старого OpenAPI). Пока строка не перенесена в `FRONTEND_CONTRACT.md`, она **не** является обязательным контрактом для разработки.

**Порядок фич и сущности «сверху»:** поэтапный план страниц, входов/выходов и доп. таблиц — в **`docs/business/BL_PAGES_AND_DATA_MODEL.md`** (краткая БЛ: **`docs/business/BUSINESS_LOGIC.md`**). Ниже — расширение реестра модулей; пути и поля согласовывать перед внедрением.

---

## Организации — расширения (нет в `OrganizationsApiService`)

| Метод | Путь | Заметка для согласования |
|--------|------|---------------------------|
| `POST` | `/organizations/import-excel` | `multipart/form-data`, поле **`file`**, лист Excel **«Организации»**; тело ответа (счётчик, ошибки?) |
| `POST` | `/organizations/:id/upload-logo` | Формат ответа: URL / полная сущность / только `logoUrl` |
| `POST` | `/organizations/:id/upload-signature` | Аналогично |
| `POST` | `/organizations/:id/upload-stamp` | Аналогично |

**Поля сущности** при создании/обновлении — как в **`FRONTEND_CONTRACT.md`** и `Organization` в `domain` (не выдумывать новые без шага согласования выше).

**Список `GET /organizations`:** уточнить, нужен ли «краткий» DTO для таблицы или всегда полный объект.

---

## Клиенты — расширения (нет в `ClientsApiService`)

| Метод | Путь | Заметка |
|--------|------|---------|
| `POST` | `/clients/import-excel` | `multipart`, поле **`file`**, лист **«Клиенты»**; ответ |

---

## Реестр модулей из прежнего стека (backlog)

До появления фичи в Nx — только ориентир по URL. **DTO не копировать вслепую** — при старте фичи описать заново в `FRONTEND_CONTRACT.md` + `domain`.

| Область | Методы и пути (кратко) |
|---------|-------------------------|
| Валюта | `GET /currency/rate` |
| Категории | `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id`, `POST /categories/import-excel` |
| Товары | `GET/POST /products`, `GET/PATCH/DELETE /products/:id`, `GET /products/search?q=`, `GET/POST /products/categories`, `GET /products/export/xlsx`, `POST /products/import/xlsx`, `POST /products/import-excel` |
| Спецификация товара | `GET /product-specification/:productId`, `PUT` — замена состава |
| Типы частей / материалы | `GET/POST /part-types`, `PATCH/DELETE /part-types/:id`; `GET/POST /materials`, `PATCH/DELETE /materials/:id` |
| КП (proposals) | `GET/POST /proposals`, `GET/PATCH/DELETE /proposals/:id`, `POST /proposals/:id/preview-pdf`, `POST /proposals/:id/send-to-yougile`, `DELETE /proposals/:id/yougile`, `GET /proposals/:id/pdf` |
| PDF-шаблоны | `GET /pdf-templates/base/:name`, `GET/PUT/DELETE /pdf-templates/organization/:organizationId` |
| Auth | `POST /auth/google`, `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Пользователи | `GET/POST /users`, `PATCH /users/:id/role`, `DELETE /users/:id` |
| Роли | `GET/PUT /roles/permissions`, `POST /roles/invite` |
| Excel всего | `GET /export/all-xlsx`, `POST /import/all-excel` |
| Realtime | `GET /realtime/events` (уточнить протокол) |
| Настройки | `GET /settings/list`, `GET/POST/PATCH /settings`, `GET/PATCH/DELETE /settings/:id` |
| Служебное | `GET /` — health |

### Дополнение к реестру (из БЛ; в старом OpenAPI не было или неявно)

До согласования с бэком — только ориентир. Детали строк КП, заказов и складских проводок см. **`docs/business/BL_PAGES_AND_DATA_MODEL.md`**.

| Область | Пути / ресурсы (черновик) |
|---------|----------------------------|
| Адреса объектов | `GET/POST/PATCH/DELETE /object-addresses` **или** поля в `Proposal` / вложенный объект в `PATCH /proposals/:id` |
| Строки КП (снимок) | `GET/POST/PATCH/DELETE /proposals/:id/items` (или эквивалент в теле `PUT` всего КП — зафиксировать стратегию) |
| Заказы | `GET/POST /orders`, `GET/PATCH/DELETE /orders/:id`, строки `.../lines` или вложенно в PATCH |
| Производство | `GET/POST/PATCH/DELETE /work-kinds`, `/performers`; назначения: `/operation-assignments` или вложенно в `order-lines` |
| Склад | `GET/POST/PATCH/DELETE /warehouses`; `GET /stock` (фильтры); `POST /stock-movements` (+ при необходимости `GET` истории) |
| Бухгалтерия | `GET/POST/PATCH/DELETE /commercial-documents` (+ `/lines` или агрегаты в одном DTO) |

### Таблица статуса (заполнять по мере работы)

| Фича | Статус | Куда перенесён контракт |
|------|--------|-------------------------|
| Категории, материалы, типы деталей (CRUD) | фронт готов, LS + опциональный API | `FRONTEND_CONTRACT.md` — пути `categories`, `materials`, `part-types` |
| Товары (CRUD) | фронт готов, LS + опциональный API | `FRONTEND_CONTRACT.md` — `products` |
| Спецификации товара (вложенный ресурс, матрица вариантов) | **UI отложен**; типы + `ProductSpecificationsApiService` в репо | при возврате фичи — контракт в `FRONTEND_CONTRACT.md` |
| *пример: импорт организаций* | не начато | — |

---

## КП (proposals): MVP по текущим договорённостям (пока в backlog)

| Область | Эндпоинты / правила (черновик) |
|---------|----------------------------------|
| CRUD КП | `GET /proposals`, `GET /proposals/:id` (корень + текущая версия), `POST /proposals` (создаёт root + v01), `PATCH /proposals/:id`, `DELETE /proposals/:id` (изменение/удаление затрагивает текущую версию) |
| Смена статуса КП | `PATCH /proposals/:id/status` или `POST /proposals/:id/transition` (валидировать допустимость переходов) |
| Статусы КП | заранее создаются в БД: `proposal_waiting`, `proposal_approved`, `proposal_paid` (name редактируемый, правила завязаны на key/statusId) |
| Блокировка редактирования после `proposal_paid` | API запрещает изменение/удаление **текущей версии** КП, если её статус `proposal_paid` |
| Версионирование КП | `POST /proposals/:id/versions`: создать новую версию КП (02/03/...) и скопировать позиции текущей версии как snapshot; после этого в UI актуальной становится последняя версия |
| PDF генерация | `POST /proposals/:id/preview-pdf` (async job) и `GET /pdf-jobs/:jobId`; PDF формируется строго по snapshot конкретной версии (не подтягивая “живые” справочники) |

### Мини-финансы: долг/оплачено на карточке `Client` (в backlog)
| Область | Эндпоинты / правила (черновик) |
|---------|----------------------------------|
| Якорь обязательства (“Оплатил”) | переход текущей версии КП в `proposal_paid` фиксирует `totalCommitted` для этой версии (и запускает поток создания `Order`, если он включён) |
| Ввод суммы в диалоге | `POST /proposals/:id/payments` принимает `amount` (ручной ввод) или флаг “вся сумма” (значение предзаполнено из КП) |
| Факт оплаты (“Аванс” и доплаты) | тот же endpoint: тип операции определяется по введённой сумме относительно `totalCommitted` (advance/rest/full) |
| Баланс клиента | `GET /clients/:id/balance` → `{ totalCommitted, paid, debt }` |
| Список документов с суммами | `GET /clients/:id/proposals` → список версий с `{ versionNo, totalCommitted, paidSum, debt, status }` |

См. также: `docs/business/CLIENT_PAYMENTS_BALANCE.md`.

---

## Заказы и производство — чеклист внедрения (UI/процессы)

> В БД/API заказ уже появился (`Order`, `OrderLine` со snapshot товара + `quantity/unit` для производства), но UI и производственные процессы ещё не заведены в контракт.

### Страница “список заказов”
1. Маршрут: `/production/orders` (фильтры по `status.key`, сортировки по `createdAt`).
2. Минимальная таблица: `number`, `status.key`, `clientId/организация`, `createdAt`.
3. Переход на `/production/orders/:id` по клику строки.

### Страница “заказ: позиции”
1. Маршрут: `/production/orders/:id`.
2. Таблица `lines[]`:
   - `productionCode` (код позиции производства)
   - `productSnapshot.productName` (для истории/гарантии)
   - `quantity` и `unit` (что и сколько производим)
   - `mounts` и `functionalities` (выбранные варианты на момент заказа)
3. Правила read-only/editability по статусам заказа (после запуска цепочки “прошлого” вносить изменения только новым документом/версией, как определим ниже).

### RBAC (минимум)
1. Кто видит: просмотр `production/orders`.
2. Кто может планировать/двигать по цепочке (например “планировать”, “закуплено”, “отгружено”).

### Точность “гарантийного” восстановления
1. Убедиться, что визуальная история/состав аналогичного товара восстанавливается строго из snapshot:
   - `OrderLine.productSnapshot`
   - `OrderLine` комплектация (mounts/functionalities)
2. Зафиксировать, что справочники, изменённые позже, не меняют “прошлое”.

### Если потребуется дальнейшее API
1. Transition API для статусов заказа (какие статусы допустимы и кому).
2. “Операции/производство” по строкам заказа: какой endpoint/DTO нужен и какие поля обязательно фиксировать в БД.

---

## Товары: клон + монтаж/функциональность (пока в backlog)

| Область | Эндпоинты / правила (черновик) |
|---------|----------------------------------|
| Клон товара | `POST /products/:id/clone` |
| Справочник “виды монтажа” | `GET/POST/PATCH/DELETE /mount-types` |
| Справочник “функциональности” | `GET/POST/PATCH/DELETE /functionalities` |
| Привязки к товару | либо расширенный `PATCH /products/:id` (в теле массивы ids), либо отдельные join-эндпоинты: `GET/POST/PATCH/DELETE /products/:id/mounts` и `.../functionalities` |

---

## История (чеклист)

| Дата | Что |
|------|-----|
| 2026-03-20 | Вынесено из объединённого `FRONTEND_CONTRACT.md`: backlog + правило согласования перед внедрением. |
| 2026-03-20 | Ссылка на `docs/business`, раздел «Дополнение к реестру» (заказы, склад, строки КП, бух). |


---

**Синхронизация:** при правках кода по паттернам Eve-Arch обновляй связанные разделы — [../ai/DOCS_SYNC_RULES.md](../ai/DOCS_SYNC_RULES.md) · [../ai/EVE_ARCH_INDEX.md](../ai/EVE_ARCH_INDEX.md)
