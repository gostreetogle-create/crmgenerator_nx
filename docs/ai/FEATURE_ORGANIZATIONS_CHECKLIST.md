# Фича `organizations` — чек-лист состояния

## Summary
Фича управления организациями: список, поиск, сортировка, пагинация, создание/редактирование в модальном окне, просмотр деталей и удаление с подтверждением. Поля из `docs/Пример полей схем бд/api.ts` (CreateOrganizationDto).

Расположение:
- Страница: `apps/web/src/app/features/organizations/organizations-page.component.ts`
- Форма: `apps/web/src/app/features/organizations/organization-form.component.ts`
- Сервис: `apps/web/src/app/features/organizations/organizations.service.ts`

## Links
- `docs/ai/ARCHITECTURE.md` (правила слоёв и Smart/Dumb)
- `docs/ai/FEATURE_CHECKLIST_BASE.md` (как вести этот документ)
- Роутинг: `apps/web/src/app/app.routes.ts` (маршрут `/organizations`)
- Модель: `libs/domain/src/lib/organizations/organization.model.ts`
- Схема БД: `docs/Пример полей схем бд/api.ts`

## Definition of MVP (для текущей итерации)
Пользователь может:
- создать организацию
- отредактировать существующую
- удалить организацию (через подтверждение)
- увидеть список организаций
- найти организацию по имени, ИНН, телефону, email, ФИО руководителя

## Non-goals (сейчас)
- Бэкенд/API: нет реального HTTP
- Загрузка логотипа/подписи/печати (logoUrl, signatureUrl, stampUrl — только отображение)
- Импорт из Excel

## Implementation checklist

### Архитектура и стили
- [x] Корневой класс формы `.org-form`, селекторы в SCSS вложены под ним (`ViewEncapsulation.None` без глобальных `.field` / `.notes-area`)
- [x] Проверка пересечения с другими фичами: форма `clients` использует `.client-form` с вложенными селекторами (см. `ARCHITECTURE.md`)
- [x] Нет `feature → feature`, deep-import, дублей ui-kit в фиче

### Данные / БЛ
- [x] CRUD: `addOrganization`, `updateOrganization`, `removeOrganization` в `OrganizationsService`
- [x] Persistence: список в `localStorage` (`crmgenerator_nx_organizations_v1`)
- [x] Генерация `_id` на создание: `crypto.randomUUID()`
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
- 2026-03-20: старт фичи organizations (модель из api.ts, блоки полей)
- 2026-03-20: MVP реализован (CRUD, поиск, сортировка, пагинация, форма по блокам, unit-тесты)

## Completion & Archiving

- [ ] Ready for archiving (criteria MVP done)
- Archive status: не в архиве
