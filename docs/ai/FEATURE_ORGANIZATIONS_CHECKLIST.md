# Фича `organizations` — чек-лист состояния

## Summary
Фича управления организациями: список, поиск, сортировка, пагинация, создание/редактирование в модальном окне, просмотр деталей и удаление с подтверждением. Поля и контракт API: `libs/domain` (`Organization`), **`docs/api/FRONTEND_CONTRACT.md`** (внедрено), при планировании расширений — **`docs/api/API_FUTURE_CHECKLIST.md`**, `OrganizationsApiService`.

Расположение:
- Страница: `apps/web/src/app/features/organizations/organizations-page.component.ts`
- Форма: `apps/web/src/app/features/organizations/organization-form.component.ts`
- Сервис: `apps/web/src/app/features/organizations/organizations.service.ts`

## Links
- `docs/ai/ARCHITECTURE.md` (правила слоёв и Smart/Dumb)
- `docs/ai/FEATURE_WITH_API_PATTERN.md` (норматив: CRUD + optional HTTP — эталонная фича)
- `docs/ai/FEATURE_CHECKLIST_BASE.md` (как вести этот документ)
- Роутинг: `apps/web/src/app/app.routes.ts` (маршрут `/organizations`)
- Модель: `libs/domain/src/lib/organizations/organization.model.ts`
- Контракт API / модель: `docs/api/FRONTEND_CONTRACT.md`, `libs/domain/src/lib/organizations/` (backlog API: `docs/api/API_FUTURE_CHECKLIST.md`)

## Definition of MVP (для текущей итерации)
Пользователь может:
- создать организацию
- отредактировать существующую
- удалить организацию (через подтверждение)
- увидеть список организаций
- найти организацию по имени, ИНН, телефону, email, ФИО руководителя

## Non-goals (сейчас)
- Реальный бэк опционален: при **`apiBaseUrl`** CRUD идёт через **`OrganizationsApiService`**; без URL — `localStorage`
- Отправка файлов на сервер (`POST .../upload-logo` и т.д.) — в UI data URL; при remote без upload-эндпоинтов большие поля уходят в JSON как есть
- Импорт из Excel

## Implementation checklist

### Архитектура и стили
- [x] Форма в модалке: **вкладки** (Реквизиты / Адреса и банк / Контакты и руководитель / Файлы и настройки) — без скролла всей панели; прокрутка только у области вкладки при необходимости; «Отмена»/«Сохранить» закреплены снизу
- [x] Корневой класс формы `.org-form`, селекторы в SCSS вложены под ним (`ViewEncapsulation.None` без глобальных `.field` / `.notes-area`)
- [x] Проверка пересечения с другими фичами: форма `clients` использует `.client-form` с вложенными селекторами (см. `ARCHITECTURE.md`)
- [x] Нет `feature → feature`, deep-import, дублей ui-kit в фиче

### Медиа (логотип / подпись / печать)
- [x] Загрузка файла в форме (превью, лимит 512 КБ, `logoUrl` / `signatureUrl` / `stampUrl` как data URL)
- [x] Сохранение полей при create/update, миниатюра в таблице, блок в деталях

### Данные / БЛ
- [x] CRUD: `addOrganization`, `updateOrganization`, `removeOrganization` в `OrganizationsService`
- [x] Persistence: без `apiBaseUrl` — `localStorage` (`crmgenerator_nx_organizations_v1`); с API — только HTTP (LS не пишется)
- [x] Генерация `_id` на создание: локально `crypto.randomUUID()`; при API — id с сервера из ответа `create`
- [x] Реактивное обновление через `signal`

### UI / UX
- [x] Список организаций с основными полями
- [x] Поиск по name, shortName, fullName, inn, phone, email, directorFio
- [x] Сортировка по `name` и `inn`
- [x] Пагинация (pageSize=10)
- [x] Создание/редактирование в модальном окне (форма по блокам)
- [x] Валидация формы (name обязателен)
- [x] Удаление через `app-confirm-dialog`
- [x] Просмотр деталей в модальном окне
- [x] Доступность: Escape, фокус-ловушка

### Роутинг / deep-linking
- [x] Синхронизация search/page/sort/asc в query params
- [x] Deep-link по прямой ссылке

### Валидация
- [x] `name` обязателен
- [x] `inn`, `kpp`, `ogrn`, `okpo`, `bik`: только цифры (если заданы)
- [x] `email`: regex
- [x] `phone`: мин. длина при задании
- [x] `markup`, `vatPercent`: 0–100

### Tests & QA
- [x] Unit-тесты для `OrganizationsService`
- [ ] Ручная проверка сценариев

## Risks / open questions
- Поля logoUrl, signatureUrl, stampUrl — загрузка файлов при подключении API.

## History
- 2026-03-20: старт фичи organizations (модель в `libs/domain`, блоки полей в форме)
- 2026-03-20: MVP реализован (CRUD, поиск, сортировка, пагинация, форма по блокам, unit-тесты)

## Completion & Archiving

- [ ] Ready for archiving (criteria MVP done)
- Archive status: не в архиве


---

**Синхронизация:** при правках кода по паттернам Eve-Arch обновляй связанные разделы — [DOCS_SYNC_RULES.md](./DOCS_SYNC_RULES.md) · [EVE_ARCH_INDEX.md](./EVE_ARCH_INDEX.md)
