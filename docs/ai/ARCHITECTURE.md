# Архитектура фронтенда (NX)

**Важно для ИИ (и для человека):**  
При добавлении/удалении модуля, библиотеки, фичи или компонента — **обязательно обновляй этот файл**.  
Структура и правила должны быть реальными 100%.

## Цель  
Чистый, масштабируемый Angular-фронт на NX (standalone + signals).  
UI-компоненты переиспользуемые, бизнес-логика только в features, единый стиль через design-tokens.

## Структура репозитория

```text
my-monorepo/
  apps/
    web/                    # основное приложение (Angular standalone)
  libs/
    ui-kit/                 # переиспользуемые компоненты (button, input, card, confirm-dialog и т.д.)
    shared/                 # общие утилиты, типы, guards (без Angular-компонентов)
    design-tokens/          # цвета, радиусы, шрифты, spacing, shadows (SCSS + Tailwind)
  docs/
    ai/                     # этот файл + COMPONENT_TEMPLATE.md + COMPONENT_CATALOG.md
  nx.json
  tsconfig.base.json
  package.json
libs/ui-kit

Компоненты: button, input, card, confirm-dialog и т.д.
Экспорт: index.ts → export * from './button';
Стили: через :host + переменные из design-tokens
ViewEncapsulation: None (для всех компонентов ui-kit)
Создание: nx g @nx/angular:component button --project=ui-kit --style=scss --standalone --export

Стандарт структуры (обязательно):
- Каждый UI-компонент живёт в отдельной папке: `libs/ui-kit/src/lib/<component-name>/`
- В папке компонента только связанные файлы: `<name>.ts`, `<name>.html`, `<name>.scss`, `<name>.spec.ts`, `index.ts`
- В `libs/ui-kit/src/lib/` не должно быть "плоских" файлов компонентов и временных дублей (`*.component.ts`, `ui-kit.ts` и т.п.)
- Публичный экспорт только через `libs/ui-kit/src/index.ts`
- Внутренние импорты в ui-kit делай через относительные пути между папками компонентов (`../button`, `../card`), а не через app-level aliases

Эталон:
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

apps/web

src/app/core/ — роутинг, layout, http-client, auth
src/app/features/<feature>/ — страницы/фичи (clients, organizations и т.д.)
каждый feature: page.component.ts, form.component.ts, service.ts, model.ts

src/app/shared/ — только локальные утилиты (если не вынес в libs)

Guardrail: feature не импортирует другую feature.
Проверка: npm run arch:check + nx run web:lint --fix
Design System
Все стили только через libs/design-tokens (переменные OKLCH + Tailwind).
Компоненты не содержат хардкод цветов, шрифтов, теней — только var(--...).
Правила для ИИ (Design Tokens + UI-kit)

Всегда используй глобальные переменные из design-tokens (var(--primary), var(--spacing-1) и т.д.).
Не хардкодь цвета, шрифты, тени, радиусы, spacing.
При создании компонента в ui-kit — обязательно:
encapsulation: ViewEncapsulation.None
@use "@design-tokens/styles/tokens" as tokens;
стили через var(--...) или tokens.$var
классы на реальном элементе (<button [class]="...">), не только host

Запрещено создавать локальные button/input/card/confirm в features — только через @ui-kit/button, @ui-kit/input, @ui-kit/card, @ui-kit/confirm-dialog.
При создании новой фичи — обновляй этот файл.
При создании компонента — следуй COMPONENT_TEMPLATE.md.
Отслеживание компонентов и артикулов — через Component Catalog (кнопка "UI" в хедере).

Feature Pattern (эталон) — Clients
Все будущие фичи (Organizations, Products, Proposals и т.д.) должны быть сделаны ТОЧНО по этому шаблону, чтобы юзабилити и визуал были идентичными.
Структура фичи (пример clients):
textfeatures/clients/
  clients-page.component.ts        # основная страница
  clients-form.component.ts        # отдельный компонент формы
  clients.service.ts               # сервис на сигналах
  clients.model.ts                 # interface Client по DTO
Обязательные элементы (как в clients):

Поиск сверху (app-input)
Таблица с сортировкой по клику на заголовки
Пагинация (10 элементов + кнопки Пред/След)
Удаление через ConfirmDialog из ui-kit (не нативный confirm)
Кнопка "Детали" → модалка просмотра всех полей
Форма создания/редактирования — только через отдельный *FormComponent
Все UI-элементы — только из ui-kit
Tight-дизайн, цвета/размеры/шрифты — только через design-tokens + var(--...)
Артикулы компонентов — в Component Catalog

Правило для любого ИИ и разработчика:
"При создании новой фичи — копируй структуру, поведение и визуал clients на 100%. Изменяй только название фичи и поля из DTO. Никаких отклонений по юзабилити и стилю."
Component Catalog
Кнопка "UI" в хедере приложения открывает каталог всех компонентов ui-kit.
Каталог — источник правды по внешнему виду и артикулам.

Артикулы: b-01 (Primary Button), b-02 (Secondary), i-01 (Default Input), c-01 (Card) и т.д.
Когда нужно изменить компонент (например "b-02 сделать больше") — меняй в ui-kit → изменения сразу видны в каталоге и во всём приложении.

COMPONENT_TEMPLATE.md (чек-лист для создания компонента)
(ссылка на существующий файл — не удаляй, он остаётся актуальным)

Команда: nx g @nx/angular:component ... --project=ui-kit --style=scss --standalone --export
encapsulation: ViewEncapsulation.None
@use "@design-tokens/styles/tokens" as tokens;
Классы на реальном элементе через computedClasses()
Цвета/тени/шрифты только var(--...)
Тест: nx serve web + Ctrl+F5 — видно ли изменения?
Линтинг: npm run ui:lint

Общее

Standalone — все компоненты без NgModule
Signals — где возможно (state, computed, input/output)
Path aliases (tsconfig.base.json):JSON"@ui-kit/*": ["libs/ui-kit/src/lib/*"],
"@design-tokens/*": ["libs/design-tokens/src/*"]
Команды:
nx serve web — запуск
nx build web — билд
nx g @nx/angular:component ... — создание
npm run ui:lint — проверка ui-kit + design-tokens + web


Запреты:

Нет ng g
Нет локальных UI-компонентов в features
Нет импортов из feature в feature
Нет хардкода стилей — только design-tokens