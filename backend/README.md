# Backend (MVP)

REST API под фронт (`/api/...`) + Prisma + PostgreSQL.

## Старт
Поддерживаются два окружения: `dev` и `prod`.

Примечание по `.env`: Prisma по умолчанию читает именно `backend/.env`. Поэтому для локального запуска и для сервера проще всего держать актуальные значения в `backend/.env`, используя `.env.development.example` и `.env.production.example` только как шаблоны для копирования.

### DEV (локальная проверка)
1. Скопировать `./.env.development.example` в `./.env`.
2. Убедиться, что `DATABASE_URL` указывает на вашу локальную БД (docker-compose в этом репозитории обычно поднимает Postgres на порту `5433`).
3. Выполнить:
   - `npm run prisma:migrate`
   - `npm run dev`

### PROD (сервер)
1. Скопировать `./.env.production.example` в `./.env`.
2. Указать `CORS_ORIGIN` (не `*`, а origin вашего фронта) и корректный `DATABASE_URL`.
3. Выполнить (на сервере):
   - `npm run prisma:migrate`
   - `npm run build && npm run start`
2. Создать таблицы:
   - `npm run prisma:migrate`

## Поддержанные эндпоинты (по текущему `docs/api/FRONTEND_CONTRACT.md`)
- `/api/organizations` CRUD
- `/api/clients` CRUD
- `/api/categories` CRUD
- `/api/materials` CRUD
- `/api/part-types` CRUD
- `/api/products` CRUD
- `/api/products/search?q=...`

## Эндпоинты (MVP backlog / продолжение)
- `/api/mount-types` CRUD
- `/api/functionalities` CRUD
- `/api/products/:id/mounts` (GET, PUT) — привязка “товар ↔ виды монтажа”
- `/api/products/:id/functionalities` (GET, PUT) — привязка “товар ↔ функциональности”

## КП / proposals (MVP)
- `GET /api/proposals`
- `POST /api/proposals` (создаёт root + v01 в статусе `proposal_waiting`)
- `GET /api/proposals/:id` (root + текущая версия + items)
- `PATCH /api/proposals/:id` (редактирует items текущей версии; запрещено если текущая версия `proposal_paid`)
- `DELETE /api/proposals/:id` (удаление root; запрещено если текущая версия `proposal_paid`)
- `PATCH /api/proposals/:id/status` (смена статуса текущей версии)
- `POST /api/proposals/:id/versions` (создаёт новую версию 02/03/... со snapshot текущих items)
- `POST /api/proposals/:id/preview-pdf` (async job; возвращает `jobId`)
- `GET /api/pdf-jobs/:jobId` (статус + `pdfUrl` после готовности)
- `GET /api/files/:fileName` (выдача PDF файлов, используется `pdfUrl`)

