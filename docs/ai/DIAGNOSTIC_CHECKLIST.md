# Диагностический чек-лист фронтенда

Этот файл используется как "машина на стенде".  
На команду **"сделай диагностику"**: пройти весь список, обновить статусы, указать болевые точки и предложить фикс.

## Таблица диагностики

| Пункт | Статус | Логи/детали | Фикс (если нужно) |
|---|---|---|---|
| Импорты `@ui-kit` в `clients-page.component.ts` (`ButtonComponent`, `CardComponent`, `DialogComponent`) | ✅ | В `imports[]` есть `ButtonComponent`, `CardComponent`, `DialogComponent`, `InputComponent`. | — |
| Импорты `@ui-kit` в `ui-catalog.component.ts` (`ButtonComponent`, `CardComponent`, `DialogComponent`) | ✅ | В `imports[]` есть `ButtonComponent`, `InputComponent`, `CardComponent`, `DialogComponent`. | — |
| Standalone-конфиг страницы `clients` | ✅ | Компонент standalone, роут `path: 'clients', component: ClientsPageComponent`. | — |
| Роутинг и lazy | ✅ | В `app.routes.ts` lazy не используется для `clients`/`ui`; прямые standalone routes. | — |
| `provideHttpClient(withFetch())` в `app.config.ts` | ✅ | Есть `provideHttpClient(withFetch(), withInterceptors(...))`. | — |
| Провайдеры приложения в `app.config.ts` | ✅ | Есть `provideRouter`, `APP_ENVIRONMENT`, hydration, error listeners. | — |
| `:host { display: block; }` в `card.component.scss` | ✅ | `:host { display: block; }` присутствует. | — |
| CardComponent проекция | ✅ | `slot="body"` + `ng-content` в `card.html` | — |
| Проекция в `dialog.component.html` | ✅ | Есть `<ng-content select="[slot=body]">` и дефолтный `<ng-content>`. | — |
| Формы в модалках | ⚠️ | Проверены `client/organization/product/material/category/part-type` формы: поля в шаблонах есть (`app-input`, `select`, `textarea`), формы вставлены в `app-dialog` с `slot="body"`, `ngOnInit`-логи приходят (`Форма init...`), но в UI (`/clients` → "Добавить клиента") тело формы остаётся визуально пустым. | Подозрение на слой проекции/лейаута `dialog -> card -> form` (контент есть, но не отображается). Следующий шаг: локализовать CSS-контекст высоты/overflow и проверить computed layout для `app-client-form`, `.card-body`, `.client-form-tab-panel`. |
| `ClientsService` init-лог в constructor | ✅ | Лог появляется: `ClientsService init, clients = ...`. | Лог оставить только на период диагностики; убрать в релизном проходе. |
| `clients()` в `clients-page ngOnInit` | ✅ | Лог показывает список объектов, не пустой массив. | Лог оставить только на период диагностики; убрать в релизном проходе. |
| `apiBaseUrl` в `environment` | ⚠️ | `apiBaseUrl: ''` (локальный режим/кэш). | Если нужен backend, задать URL API. |
| `effect()` в `clients-page` | ✅ | `effect` для refresh/sync расположен в constructor (корректный injection context). | — |
| Данные и загрузка (`clients`) | ✅ | Есть seed/fallback в сервисе, список формируется. | — |
| `nx lint web` | ⚠️ | 0 ошибок, 2 warning: non-null assertion в spec-файлах (`clients.service.spec.ts`, `organizations.service.spec.ts`). | По желанию убрать `!` в тестах (не блокирует сборку). |
| `nx test web` | ✅ | Добавлен базовый тест формы `client-form.component.spec.ts`: проверка рендера `app-input`. | Если регресс: проверить standalone imports формы и рендер слотов в `app-card`. |
| Консоль браузера (`/clients`, `/ui`) | ✅ | Критических Angular ошибок после фикса нет; данные инициализируются. | При регрессе: проверить `No provider`, `NG0203`, `NG0100`, `zone.js` ошибки. |

## Секции проверки

### 1) Импорты и standalone
- Проверить `imports[]` в page-компонентах (`clients`, `ui-catalog`): UI-kit компоненты подключены явно.
- Проверить, что страницы standalone и роутятся через `component`.

### 2) Сигналы и сервисы
- Проверить `inject(...)` в сервисах/страницах.
- Проверить `clients()`/`filteredClients()` в runtime логах.
- Проверить `effect(...)` в корректном injection context (constructor/field initializer).

### 3) Роутинг и lazy
- Проверить `app.routes.ts` на валидные `component`/`children`.
- Если появится lazy: убедиться, что standalone-компоненты корректно импортируют UI-kit.

### 4) CSS/SCSS и проекция
- Проверить `:host { display: block; }` в UI-kit контейнерных компонентах.
- Проверить `ng-content` + слоты в `Card/Dialog`.

### 5) Данные и загрузка
- Проверить режим данных: `apiBaseUrl` пустой/непустой.
- Проверить fallback/seed при пустом списке.

### 6) Тесты и lint
- Выполнить `npx nx lint web`.
- Выполнить `npx nx test web`.

### 7) Консольные логи
- Открыть `/clients` и `/ui`, собрать консоль.
- Зафиксировать ошибки/предупреждения и привязать к фиксу.

## Вывод по текущему проходу

- **Болит:** `apiBaseUrl` пустой (ожидаемо для local-only режима), плюс 2 lint warning в spec.
- **Фикс:** задать API URL при переходе на backend; опционально убрать non-null assertion в двух тестах.

Если все критичные пункты зелёные, финальная фраза:  
**"Диагностика завершена: всё ок"**

Если есть проблемы, финальная фраза:  
**"Болит: X → фикс: Y"**


---

**Синхронизация:** при правках кода по паттернам Eve-Arch обновляй связанные разделы — [DOCS_SYNC_RULES.md](./DOCS_SYNC_RULES.md) · [EVE_ARCH_INDEX.md](./EVE_ARCH_INDEX.md)
