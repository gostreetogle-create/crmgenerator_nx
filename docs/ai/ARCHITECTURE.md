# Архитектура фронтенда (NX)

**Важно для ИИ и разработчика:**  
Любое изменение структуры, слоёв, импортов, фич и публичных API должно отражаться в этом файле.

## Цель
Поддерживать предсказуемый и масштабируемый Angular/Nx фронтенд:  
- переиспользуемый UI в `ui-kit`  
- бизнес-логика в `features`  
- чёткие границы слоёв  
- единый дизайн через `design-tokens`  
- минимальный риск "архитектурного мусора"

## Слои и ответственность

### 1) `apps/web` (composition layer)
- Точки входа приложения (`main.ts`, `app.config.ts`, роутинг, layout).
- Связывает фичи между собой, но не хранит доменную бизнес-логику.
- Не содержит дублирующие UI-компоненты, если они уже есть в `ui-kit`.

### 2) `apps/web/src/app/features/*` (domain feature layer)
- Каждая папка — отдельная предметная фича (`clients`, `organizations`, `products`...).
- Внутри фичи: page/container, формы, локальные модели/мапперы, feature-сервис.
- Feature не импортирует другую feature напрямую.

### 3) `libs/ui-kit` (presentational UI layer)
- Только "глупые" переиспользуемые компоненты (Button, Input, Card, ConfirmDialog...).
- Никакой доменной логики, HTTP, роутинга, knowledge о фичах.
- API через `input/output`; состояние только UI-уровня (open/loading/disabled).

### 4) `libs/design-tokens` (design system layer)
- Единственный источник токенов: цвета, spacing, тени, типографика, radius.
- Любая визуальная настройка через `var(--...)`, без хардкода.

### 5) `libs/shared` (cross-feature logic layer)
- Общие типы, утилиты, guards, pure функции.
- Без Angular UI-компонентов.

## Smart и Dumb компоненты (обязательное правило)

### Smart (container) компоненты
- Расположение: только `features/*`.
- Отвечают за: получение данных, orchestration, сигналы состояния, вызовы сервисов, роутинг.
- Могут знать DTO/модели конкретной фичи.

### Dumb (presentational) компоненты
- Расположение: преимущественно `libs/ui-kit` (или локально в фиче, если компонент 100% специфичен и не переиспользуется).
- Отвечают только за отображение и события `input/output`.
- Не делают HTTP, не ходят в `Router`, не хранят бизнес-правила.

Правило потока: **Smart -> Dumb через `input`**, **Dumb -> Smart через `output`**.

## Точки входа и публичный API

- Каждый reusable модуль имеет `index.ts` как публичный entry point.
- Импортировать только через публичный API, не через глубокие пути файлов.
- Для `ui-kit`:
  - внешний импорт из app: `@ui-kit/button`, `@ui-kit/input`, `@ui-kit/card`, `@ui-kit/confirm-dialog`
  - внутренние импорты внутри `ui-kit`: относительные (`../button`, `../card`)
- Запрещены deep-importы вида `libs/.../src/lib/.../file.ts`.

## Стандарт структуры папок

### Репозиторий
```text
apps/
  web/
    src/app/
      core/
      features/
      shared/
libs/
  ui-kit/
  design-tokens/
  shared/
docs/ai/
```

### `ui-kit` (обязательно "один компонент = одна папка")
```text
libs/ui-kit/src/lib/
  button/
    button.ts
    button.html
    button.scss
    button.spec.ts
    index.ts
  input/
    input.ts
    input.html
    input.scss
    input.spec.ts
    index.ts
  card/
    card.ts
    card.html
    card.scss
    card.spec.ts
    index.ts
  confirm-dialog/
    confirm-dialog.ts
    confirm-dialog.html
    confirm-dialog.scss
    confirm-dialog.spec.ts
    index.ts
```

### Feature-шаблон (эталон)
```text
apps/web/src/app/features/<feature>/
  <feature>-page.component.ts       # smart container
  <feature>-page.component.html
  <feature>-page.component.scss
  <feature>-form.component.ts       # dumb/presentational (feature-specific)
  <feature>-form.component.html
  <feature>-form.component.scss
  <feature>.service.ts              # feature facade/state/business orchestration
  <feature>.model.ts                # types/interfaces
```

## Правила переиспользуемости

- Если компонент нужен в 2+ фичах -> переносим в `libs/ui-kit` (UI) или `libs/shared` (logic/types).
- Если компонент фиче-специфичен и не ожидается reuse -> оставляем в feature.
- Не дублировать одинаковые кнопки/инпуты/карточки в `features`.
- Любые изменения базового UI сначала отражаются в Component Catalog.

## Дизайн и стилизация

- Для ui-компонентов `ViewEncapsulation.None`.
- Классы применяются к реальным DOM-элементам, не только host.
- В `.scss` компонентов обязательный импорт токенов: `@use "tokens";`
- Цвета/тени/шрифты/spacing/radius: только `var(--...)` из `design-tokens`.
- Запрещён визуальный хардкод (`#...`, `rgba(...)`, fixed shadow values), кроме обоснованных случаев в токенах.

## Guardrails по импортам

- `features/*` -> можно: `ui-kit`, `shared`, `design-tokens`; нельзя: другие `features/*`.
- `ui-kit` -> можно: `design-tokens`; нельзя: `features/*`.
- `shared` -> нельзя зависеть от `features/*` и `ui-kit`.
- `apps/web/core` -> может оркестрировать feature-маршруты и app-level провайдеры, но не дублирует feature-сервисы.

## Component Catalog

- Кнопка `UI` в хедере открывает каталог компонентов.
- Каталог — источник правды по артикулам и визуалу (`b-01`, `b-02`, `i-01`, `c-01`...).
- Любая правка ui-kit проверяется в каталоге и в реальных экранах.

## Обязательная проверка перед коммитом

1. `npm run ui:lint`
2. `nx serve web` + hard refresh (`Ctrl+F5`) для визуальной проверки
3. Проверка, что нет deep-import и нет новых дублирующих компонентов
4. Обновление `docs/ai/ARCHITECTURE.md`, если менялась структура или правила

## Базовые команды

- `npx nx serve web`
- `npx nx build web`
- `npx nx g @nx/angular:component ...`
- `npm run ui:lint`

## Жёсткие запреты

- Нет локальных дублей `button/input/card/confirm-dialog` внутри `features`.
- Нет импортов из feature в feature.
- Нет deep-import в обход `index.ts`.
- Нет хардкода дизайн-значений вне `design-tokens`.
- Нет создания архитектурных сущностей без обновления этого документа.