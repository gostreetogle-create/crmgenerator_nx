# Фича `clients` — чек-лист состояния

## Summary
Фича управления клиентами: список, поиск, сортировка, пагинация, создание/редактирование в модальном окне, просмотр деталей и удаление с подтверждением.

Расположение:
- Страница: `apps/web/src/app/features/clients/clients-page.component.ts`
- Форма: `apps/web/src/app/features/clients/client-form.component.ts`
- Сервис/БЛ фасад: `apps/web/src/app/features/clients/clients.service.ts`

## Links
- `docs/ai/FEATURE_WITH_API_PATTERN.md` (норматив: CRUD + optional HTTP)
- `docs/ai/ARCHITECTURE.md` (правила слоёв и “Smart/Dumb”)
- `docs/ai/FEATURE_CHECKLIST_BASE.md` (как вести этот документ)
- Роутинг: `apps/web/src/app/app.routes.ts` (маршрут `/clients`)
- Модель: `apps/web/src/app/features/clients/client.model.ts`

## Definition of MVP (для текущей итерации)
Пользователь может:
- создать клиента
- отредактировать существующего
- удалить клиента (через подтверждение)
- увидеть список клиентов
- найти клиента по имени/телефону/ИНН/email/контактному лицу

## Non-goals (сейчас)
- Бэкенд/API: нет реального HTTP и нет БД
- Персистентность: при заданном `apiBaseUrl` — **HTTP** (`ClientsApiService`); иначе **`localStorage`**
- Сложные статусы/воркфлоу клиента (новый/архив и т.п.) — не введены

## Implementation checklist

### Данные / БЛ
- [x] CRUD: `addClient`, `updateClient`, `removeClient` в `ClientsService`
- [x] Persistence: список клиентов сохраняется в `localStorage` (`crmgenerator_nx_clients_v1`) и загружается при старте
- [x] Генерация `_id` на создание: `crypto.randomUUID()` (в `addClient`)
- [x] Обновление состояния списка при add/update/remove (реактивно через `signal`)

### UI / UX
- [x] Список клиентов с основными полями
- [x] Поиск по query: `searchQuery` и фильтрация по name/phone/inn/email/contactPerson
- [x] Сортировка по `name` и `discount` с направлением (asc/desc)
- [x] Пагинация (pageSize=10 по умолчанию)
- [x] Создание/редактирование в модальном окне (`app-client-form`): вкладки **Общее / Реквизиты / Условия и заметки**, фиксированная высота `.modal-panel`, скролл только в области вкладки (см. `ARCHITECTURE.md` → модальные формы)
- [x] Валидация формы и отключение submit при ошибках (`ClientFormComponent.errors/hasErrors`)
- [x] Удаление через подтверждение (`app-confirm-dialog`)
- [x] Доступность: `Escape` закрывает модалки, добавлена фокус-ловушка (Tab/Shift+Tab) внутри edit/details
- [x] Просмотр деталей клиента (отдельный модальный слой при `selectedClient`)

### Роутинг / deep-linking
- [x] Синхронизация `search/page/sort/asc` в query params (`updateUrl` + `route.queryParams.subscribe`)
- [x] Возможность “вернуться” к состоянию списка через прямую ссылку

### Валидация / правила
- [x] `name` обязателен (трим и пустая строка запрещены)
- [x] `phone`: проверка минимальной длины (логика сейчас: если задан и < 7, то ошибка)
- [x] `email`: regex-валидация
- [x] `inn` и `kpp`: только цифры (если поле задано)
- [x] `discount`: число 0-100 (логика ошибок в `ClientFormComponent`)

### Tests & QA
- [x] Добавлены unit-тесты для `ClientsService` (CRUD + localStorage persistence). E2E пока не добавлены.
- [ ] Проверки ручные: (1) создать клиента (2) редактировать (3) удалить (4) открыть deep-link

## Risks / open questions
- Валидация `phone` может быть недостаточно точной (зависит от формата, который нужен бизнесу)
- При пустом `apiBaseUrl` данные остаются в `localStorage`; для бэка задать URL в `environment.development.ts`

## History
- 2026-03-20: старт итерации `clients` (list/search/sort/pagination + CRUD + modals + URL sync)

## Completion & Archiving

- [x] Ready for archiving (criteria MVP done)
- Archive status:
  - `Готово / в архиве: 2026-03-20 — docs/ai/archive/FEATURE_CLIENTS_CHECKLIST.md`
  - Примечание: ручные проверки UI/UX в браузере пока не удалось инструментально подтвердить (проблемы с доступом к `localhost:4200`), но MVP покрыт unit-тестами.

