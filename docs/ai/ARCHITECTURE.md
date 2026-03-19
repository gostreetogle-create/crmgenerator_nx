# Архитектура проекта
**Важно для ИИ:** при добавлении или удалении фичи, модуля или слоя этот файл нужно обновить: добавить новое в описание структуры ниже или убрать удалённое. Документ должен соответствовать реальной структуре репозитория.
## Цель
Скелет приложения без бизнес-логики, безопасно расширяемый (в т.ч. локальным ИИ).
## Структура репозитория
textroot/
  apps/
    web/                    # Angular (standalone)
    api/                    # NestJS
  packages/
    shared/                 # общие типы/утилиты (без Angular/Nest)
  docs/
    tigran/                 # для человека: шпаргалка (RUNBOOK)
    ai/                     # для ИИ: главный вход, архитектура, спеки, чек-листы, правила
  scripts/
    arch-check.mjs          # запрет cross-feature imports (web)
    server-deploy.sh        # деплой на сервер
    server-db-dump.sh       # дамп БД на сервере
    server-db-restore.sh    # восстановление БД на сервере
    db-dump.ps1             # дамп БД локально (Windows)
    db-restore.ps1          # восстановление БД локально (Windows)
    prod.env.example        # пример .env.prod для сервера
  docker/
    docker-compose.yml      # Postgres локально
    compose.prod.yml        # прод: Caddy + web + api + postgres
    Caddyfile               # crmgenerator.ru, api.crmgenerator.ru
    api.Dockerfile
    web.Dockerfile
  prisma/
    schema.prisma
    migrations/
  package.json              # корневые команды (workspaces)
## Web (apps/web)

**src/app/core/** — http-клиент, config/env, layout, роутинг
**src/app/shared/** — ui-компоненты, utils
**src/app/features/<feature>/** — pages, components, data-access, models
**src/app/features/clients/** — страница «Заказчики» (организации/заказчики списками + модалки добавления)

**Guardrail:** feature не импортирует другую feature. Проверка: npm run arch:check.
## API (apps/api)

Конфиг только через ConfigService (не process.env в коде)
БД только через PrismaService (PrismaModule)
Глобально: ValidationPipe, CORS
Обязательный эндпоинт: GET /health
Эндпоинты (clients): GET/POST/PATCH/DELETE /organizations, GET/POST/PATCH/DELETE /clients (+ фильтр ?organizationId=...)

## Общее

**packages/shared** — без зависимостей от Angular/Nest и без импортов из apps/*
**prisma** — схема и миграции в git; команды: prisma generate, prisma migrate dev / prisma migrate deploy (прод)
**Сервер:** папка /opt/crmgenerator, домены crmgenerator.ru и api.crmgenerator.ru
Хорошо, давай перепишем под новый чистый NX-фронт.
Бэк, prisma, docker, сервер — вырезаем. Оставляем только фронт + UI-стандартизацию.
Вот свежий, лаконичный файл архитектуры — вставь его в docs/ai/architecture.md (или как хочешь назвать).
Markdown# Архитектура фронтенда (NX)

**Важно для ИИ:**  
При добавлении/удалении модуля, библиотеки или фичи — обновляй этот файл.  
Структура должна быть реальной.

## Цель  
Чистый, масштабируемый Angular-фронт на NX.  
Standalone-компоненты, signals, без бизнес-логики в UI.

## Структура репозитория (фронт)

```text
my-monorepo/
  apps/
    web/                # основное приложение (Angular standalone)
  libs/
    ui-kit/             # переиспользуемые компоненты (button, card, input, etc.)
    shared/             # общие утилиты, типы, guards (без Angular-компонентов)
    design-tokens/      # цвета, радиусы, шрифты, переменные (SCSS + TS)
  docs/
    ai/                 # этот файл + правила, чек-листы для ИИ
  nx.json
  tsconfig.base.json
  package.json
libs/ui-kit

Компоненты: button, card, input, dropdown, badge, loader
Экспорт: index.ts → export * from './button';
Стили: через :host + переменные из design-tokens
Storybook: nx storybook ui-kit (если подключишь)
Создание: nx g @nx/angular:component button --project=ui-kit

apps/web

src/app/
core/ — роутинг, layout, http-client, auth
features/ — страницы/фичи (clients, dashboard, settings)
каждый feature: page.component.ts, data-access.service.ts, models.ts

shared/ — только локальные утилиты (если не вынес в libs)

Guardrail: feature не импортирует другую feature.
Проверка: nx run web:lint --fix + npm run arch:check (добавь скрипт позже)

Общее

Standalone — все компоненты без NgModule
Signals — где возможно (state, computed)
Path aliases (в tsconfig):JSON"@ui-kit/*": ,
"@shared/*": ```
Команды:nx serve web — запуск
nx build web — билд
nx g @nx/angular:component ... — создание

Правила для ИИ

Только NX-команды (nx g, nx build, nx test)
Нет ng g
Компоненты — standalone, signals
UI из ui-kit, не дублировать
Нет импортов из feature в feature

## Design System

Все стили через `libs/design-tokens` (переменные OKLCH + Tailwind). Компоненты не содержат хардкод цветов — только `var(--...)`.

### Правила для ИИ (Design Tokens)

- Всегда используй глобальные переменные из `design-tokens`.
- Не хардкодь цвета, шрифты, тени.
- При создании компонента — добавляй импорт `tokens.scss` и ссылки на `var(...)`.
- При создании компонента — следуй `COMPONENT_TEMPLATE.md`.
- Если добавляешь новую фичу — обнови этот файл.

## Правила стилизации компонентов (2026 best practices)

### ViewEncapsulation

Для всех UI-компонентов в `ui-kit` используй `ViewEncapsulation.None` (или `ShadowDom` только если изоляция критически важна).

Почему: глобальные токены (`--primary`, `--shadow-glow`) и Tailwind должны работать без лишних обёрток.

Пример:

```ts
@Component({
  ...,
  encapsulation: ViewEncapsulation.None,
})
```

### Стили на элементе

Все классы/стили всегда на реальном DOM-элементе (`button`, `div`, `input`), а не только на `host`.

Используй `[class]="computedClasses()"` на самом элементе, а не только `host: { ... }`.

### Импорт токенов

Каждый компонент в `ui-kit` обязательно импортирует `@import "@design-tokens/styles/tokens";` в свой `.scss`.

Никогда не хардкодь цвета/тени — только `var(--...)`.

### Проверка

После создания/изменения компонента: `nx serve web` + hard refresh (`Ctrl+F5`).

Если визуально не видно, проверь:

- `encapsulation: ViewEncapsulation.None`
- Классы на элементе, а не на `host`
- Импорт `tokens.scss` в компоненте

### Автоматизация

Перед коммитом запускай `npm run ui:lint`.

Запрещено создавать локальные button/input/card в features — только через @ui-kit/button, @ui-kit/input, @ui-kit/card