# Eve-BL Index

Бизнес-потоки: какие экраны и действия отражают требования BL, связь с фазами и сущностями.

## Порядок работы

### Правило (обязательно при изменении бизнес-логики)

Любое изменение **бизнес-логики** — в том числе **CRUD**, **статусы**, **отправка** (КП, email, экспорт), **скидки/условия**, **цепочки сущностей** (связи справочников, производственные потоки):

1. **Сначала** — **`grep Eve-BL`** по проекту (или поиск в IDE по `Eve-BL:`).
2. **Подходит существующий артикул** — расширь описание/колонку «Файлы» в таблице ниже при необходимости и оставь **тот же код** в новых или затронутых местах кода.
3. **Не подходит** — создай новый артикул **`BL-<ПОТОК>-NNN`** (например `BL-KP-SEND-001`), добавь **строку в эту таблицу** (название, описание, файлы, Docs-link).
4. **В коде** сразу добавь маркер: `// Eve-BL: BL-… — кратко` (TS) или `<!-- Eve-BL: BL-… — кратко -->` (HTML).

Перед изменением **маршрутов** или **новой фичи** под BL — тот же порядок; источник требований по фазам — **BL-SOURCE-001** и `docs/business/*`.

## Таблица

| Артикул | Название | Описание | Файлы | Docs-link |
|---------|----------|----------|-------|-----------|
| **BL-SOURCE-001** | Источник требований BL | Матрица фаз, страницы, входы/выходы и сущности — до переноса в контракт и код. | `docs/business/BL_PAGES_AND_DATA_MODEL.md`; `docs/business/BUSINESS_LOGIC.md` | [BL pages & model](../business/BL_PAGES_AND_DATA_MODEL.md) |
| **BL-CAT-SHELL-001** | Оболочка каталога `/catalog/*` | Родительский маршрут справочников (категории, материалы, типы деталей, товары). | `apps/web/src/app/features/catalog/catalog-shell.component.ts`; `app.routes.ts` (children) | [ARCHITECTURE — routes-map](./ARCHITECTURE.md#routes-map) |
| **BL-CLIENTS-CRUD-001** | Заказчики: полный CRUD | Список, поиск, сорт, пагинация, скидка/реквизиты во вкладках, optional API + localStorage, deep-link query. | `clients.service.ts`; `clients-page.component.{ts,html}`; `client-form.component.ts`; `client.model.ts` | [FEATURE_CLIENTS_CHECKLIST](./FEATURE_CLIENTS_CHECKLIST.md) |
| **BL-ORGS-CRUD-001** | Организации: полный CRUD | Аналогично клиентам: справочник контрагентов, тяжёлая форма, optional API. | `organizations.service.ts`; `organizations-page.component.{ts,html}`; `organization-form.component.ts`; `organization.model.ts` | [FEATURE_ORGANIZATIONS_CHECKLIST](./FEATURE_ORGANIZATIONS_CHECKLIST.md) |
| **BL-PRODUCTS-HUB-001** | Товары: матрица колонок | Четыре колонки (категории \| товары \| тех. описание \| материалы), фильтр по выбранной строке, quick-add справочников через lookup. | `products.service.ts`; `products-page.component.{ts,html}`; `product-form.component.ts` | [FEATURE_CATALOG_PHASE2_CHECKLIST](./FEATURE_CATALOG_PHASE2_CHECKLIST.md) |
| **BL-CATEGORIES-CRUD-001** | Категории товаров | CRUD справочника категорий под товары. | `categories.service.ts`; `categories-page.component.{ts,html}`; `category-form.component.ts` | [FEATURE_CATALOG_PHASE1_CHECKLIST](./FEATURE_CATALOG_PHASE1_CHECKLIST.md) |
| **BL-MATERIALS-CRUD-001** | Материалы | CRUD справочника материалов. | `materials.service.ts`; `materials-page.component.{ts,html}`; `material-form.component.ts` | [FEATURE_CATALOG_PHASE1_CHECKLIST](./FEATURE_CATALOG_PHASE1_CHECKLIST.md) |
| **BL-PARTTYPES-CRUD-001** | Типы деталей | CRUD справочника типов деталей. | `part-types.service.ts`; `part-types-page.component.{ts,html}`; `part-type-form.component.ts` | [FEATURE_CATALOG_PHASE1_CHECKLIST](./FEATURE_CATALOG_PHASE1_CHECKLIST.md) |
| **BL-DOMAIN-MODELS-001** | Доменные сущности | Типы `Client`, `Organization`, `Product`, `Order`, `Category`, `Material`, `PartType`, `ProductSpecification` — контракт данных между фичами и API. | `libs/domain/src/index.ts`; `libs/domain/src/lib/**/*model.ts` | [ARCHITECTURE — эталон CRUD+HTTP](./ARCHITECTURE.md); [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |
| **BL-BANNER-STATE-001** | Бизнес-уведомления списка | Пользователю видны загрузка списка, ошибка remote, ошибка мутации, retry/hide — без отдельного toast-слоя. | Все `*-page.component.html` с `list-state` / `state-banner` (clients, organizations, products, categories, materials, part-types) | [ARCHITECTURE — actions-state](./ARCHITECTURE.md#actions-state) |
| **BL-ENTITY-DELETE-001** | Удаление с подтверждением | Опасное действие только через `app-dialog` `mode="confirm"` и явный сценарий отмены. | `*-page.component.html` с confirm-диалогом удаления (те же шесть фич) | [EVE_UX — UX-ANIM-001](./EVE_UX_INDEX.md) |
| **BL-FORM-ENTITY-001** | Формы сущностей | Создание/редактирование: сигнальная форма, вкладки для «тяжёлых» сущностей или компактная форма справочника. | `*-form.component.ts` в `features/clients|organizations|products|categories|materials|part-types` | [ARCHITECTURE — модальные формы](./ARCHITECTURE.md) |
| **BL-GAP-PROPOSALS-001** | КП (proposals) — нет экрана в SPA | В матрице BL/API предусмотрены КП; в текущем `app.routes.ts` маршрута нет — для презентации использовать **clients / organizations / catalog / products** и UI-каталог. | `app.routes.ts` (отсутствует path); `docs/business/BL_PAGES_AND_DATA_MODEL.md` | [FRONTEND_CONTRACT](../api/FRONTEND_CONTRACT.md) |

---

**Синхронизация:** [`DOCS_SYNC_RULES.md`](./DOCS_SYNC_RULES.md) · [`EVE_INDEXES.md`](./EVE_INDEXES.md)

**Презентация / аудит:** CRUD-сценарии проверять на перечисленных экранах; КП — отдельный этап после появления маршрута.
