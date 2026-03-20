# API: чеклист и дорожная карта (**ещё не внедрено**)

> ## Обязательно перед внедрением любой строки из этого файла
>
> 1. **Согласовать с бэком / продуктом:** поля DTO, обязательность, формат ответа (особенно `multipart`, импорт, списки с пагинацией).
> 2. **Зафиксировать истину** в **`docs/api/FRONTEND_CONTRACT.md`** и при необходимости в **`libs/domain`**.
> 3. **Добавить** методы в `apps/web/src/app/core/api/*-api.service.ts` (или отдельный сервис фичи).
> 4. **Удалить или пометить выполненным** соответствующий пункт здесь.

Этот файл — **черновик и памятка** (в т.ч. из старого OpenAPI). Пока строка не перенесена в `FRONTEND_CONTRACT.md`, она **не** является обязательным контрактом для разработки.

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
| КП (proposals) | `GET/POST /proposals`, `GET/PATCH/DELETE /proposals/:id`, `POST /proposals/preview-pdf`, `POST /proposals/:id/send-to-yougile`, `DELETE /proposals/:id/yougile`, `GET /proposals/:id/pdf` |
| PDF-шаблоны | `GET /pdf-templates/base/:name`, `GET/PUT/DELETE /pdf-templates/organization/:organizationId` |
| Auth | `POST /auth/google`, `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Пользователи | `GET/POST /users`, `PATCH /users/:id/role`, `DELETE /users/:id` |
| Роли | `GET/PUT /roles/permissions`, `POST /roles/invite` |
| Excel всего | `GET /export/all-xlsx`, `POST /import/all-excel` |
| Realtime | `GET /realtime/events` (уточнить протокол) |
| Настройки | `GET /settings/list`, `GET/POST/PATCH /settings`, `GET/PATCH/DELETE /settings/:id` |
| Служебное | `GET /` — health |

### Таблица статуса (заполнять по мере работы)

| Фича | Статус | Куда перенесён контракт |
|------|--------|-------------------------|
| *пример: импорт организаций* | не начато | — |

---

## История (чеклист)

| Дата | Что |
|------|-----|
| 2026-03-20 | Вынесено из объединённого `FRONTEND_CONTRACT.md`: backlog + правило согласования перед внедрением. |
