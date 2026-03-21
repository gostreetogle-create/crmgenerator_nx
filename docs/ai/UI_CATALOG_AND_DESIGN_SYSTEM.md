# UI-каталог и единый стиль компонентов

## Зачем это

В шапке приложения кнопка **UI** открывает **живой каталог**: что уже согласовано в дизайн-системе и что переиспользуется в фичах. Цель — не оказываться в ситуации «в одном месте одно, в другом другое» без осознанного решения.

## Два уровня (оба обязаны быть отражены в каталоге)

### 1) `libs/ui-kit` — компоненты

Переиспользуемые **Angular-компоненты** с публичным API через `@ui-kit/...`.

**Правило:** добавили новый компонент в `ui-kit` → **в той же задаче** добавьте демо в `apps/web/src/app/features/ui-catalog/` (импорт, пример в шаблоне, при необходимости цвета/токены в футере группы).

**Правило:** изменили API или внешний вид существующего компонента → **обновите** демо в UI-каталоге.

**Обязательный стандарт для кнопки `+` (быстрое создание справочника):**
- использовать `@ui-kit/quick-add-dialog` как обёртку верхнего диалога;
- quick-add форма должна обрабатывать нативный submit: `<form (submit)="onSubmit($event)">` + `preventDefault/stopPropagation`;
- в родительской форме `Сохранить` должен быть disabled при невалидности (не оставлять активную кнопку без результата).

### 2) Паттерны приложения — общие классы (не всегда отдельные компоненты)

Часть интерфейса строится **классами и разметкой**, общими для нескольких фич (таблицы списков, баннеры состояния, текстовые кнопки в таблице, модальная оболочка каталога).

Источник правды по стилям: **`apps/web/src/app/features/catalog-shared/catalog-crud-patterns.scss`**.

**Правило:** добавили новый **переиспользуемый** класс/паттерн для CRUD-страниц каталога → вынесите в `catalog-crud-patterns.scss` (или согласуйте отдельный shared-файл) и **добавьте мини-демо** в UI-каталог в секцию паттернов.

**Правило:** завели **одноразовый** стиль только в одной фиче — это нормально, но тогда **не** копируйте его в другие фичи «на глаз»; либо вынесите в паттерн/ui-kit, либо оставьте локально и зафиксируйте в чек-листе фичи, почему не общий.

### Обязательный набор visual polish для CRUD-паттерна

При доработке внешнего вида придерживаться одного набора приёмов:

- `.table-wrap`: фон карточки + граница + аккуратный скролл
- sticky header для таблиц (`thead th`)
- единые row-состояния: `hover` + `focus-within`
- явная строка `@empty` в таблице
- `state-banner` и действия только через `app-button`
- `details-grid` с единым `dt/dd` ритмом и мобильным режимом в одну колонку
- адаптивные `actions`/`pagination` без переполнения

Если меняется один из пунктов выше — одновременно обновлять:
1) `catalog-crud-patterns.scss` (источник правды),  
2) живой пример в `ui-catalog`,  
3) `docs/ai/ARCHITECTURE.md` (если поменялась норма, а не локальный фикс).

### Стандарты размеров модалок (единый словарь)

В `catalog-crud-patterns.scss` должны поддерживаться и использоваться классы:
- `modal-panel--sm`
- `modal-panel--md`
- `modal-panel--lg`
- `modal-panel--xl`

Идея простая: в ревью обсуждаем не «пиксели», а уровень размера (`sm/md/lg/xl`).

Минимальный mapping по текущим экранам:
- `categories`, `materials`, `part-types` -> `md`
- `clients` -> `lg`
- `organizations`, `products` -> `xl`
- quick-add (`@ui-kit/quick-add-dialog`) -> `sm` по умолчанию

### Длинные формы с вкладками (организации, клиенты)

Вкладки и фиксированная геометрия модалки живут в **фиче-эталоне** (`organization-form`, `client-form` + стили страницы). В UI-каталоге — **краткое демо полосы вкладок** и отсылка к `docs/ai/ARCHITECTURE.md` → «Модальные окна и формы с многими разделами».

Новая «тяжёлая» форма → следовать тому же разделу ARCHITECTURE, а не изобретать второй визуальный язык.
Для ИИ и ревью это трактуется буквально: **если есть выбор, делать как в organizations**.

## Где смотреть в коде

| Уровень        | Путь |
|----------------|------|
| Каталог в UI   | `apps/web/src/app/features/ui-catalog/` |
| ui-kit         | `libs/ui-kit/src/lib/<name>/` |
| Паттерны CRUD  | `apps/web/src/app/features/catalog-shared/catalog-crud-patterns.scss` |
| Обёртка страницы каталога (`:host`, ng-deep детали) | `catalog-crud-page.scss` |
| Токены         | `libs/design-tokens/src/styles/tokens.scss` |

## UI-паспорт (табличный минимум)

Ниже "быстрый паспорт" для презентации и разработки: артикул, что это, какие токены цвета/размеров/отступов являются нормой.

### 1) Компоненты ui-kit и демо-артикулы

| Артикул | Наименование | Цвета (основные токены) | Размеры | Отступы / ритм |
|---------|--------------|--------------------------|---------|----------------|
| `b-01` | Button / Primary loading | `--primary`, `--primary-hover`, `--text-on-primary`, `--outline` | `sm: 28px`, `md: 34px`, `lg: 40px`, min-width `80px` | `padding`: `spacing-1/2`, `spacing-2/3`, `spacing-2/4`; gap `spacing-2` |
| `b-02` | Button / Slot composition | `--secondary`, `--accent`, `--danger`, `--ghost-hover` (+ варианты `outline/ghost`) | те же, что у `b-01` | те же, что у `b-01`; slots `start/end` |
| `i-01` | Input / Prefix-suffix | `--card`, `--foreground`, `--border`, `--muted-foreground`, focus `--primary` | `sm: 30px`, `md: 36px`, `lg: 42px` | `padding`: `spacing-1/2`, `spacing-2/3`, `spacing-2/4`; shell gap `spacing-1` |
| `i-02` | Input / Error + hint | как `i-01` + `--danger` | те же, что у `i-01` | те же, что у `i-01`; hint = `font-size-sm` |
| `i-03` | Input / Disabled loading | как `i-01` (disabled/loading через opacity) | те же, что у `i-01` | те же, что у `i-01` |
| `c-01` | Card / Hoverable | `--card`, `--card-foreground`, `--border`, hover mix от `--primary` | `min-height: var(--card-min-height)` | card padding `spacing-3`; header/footer `spacing-2` |
| `c-02` | Card / Sections (header-body-footer) | те же, что у `c-01` | body скролл в фиксированной карточке | body `16px`; footer `spacing-2` |
| `d-01` | Dialog / Confirm loading | `--overlay-backdrop`, `--card`, `--border`, `--foreground` | `sm/md/lg/xl` (`560/760/1040/1280` max viewport rules) | header `spacing-3`; body `24px`; footer `16px` + gap `spacing-2` |
| `d-02` | Dialog / Content slots | те же, что у `d-01` | те же, что у `d-01` | те же, что у `d-01` |

### 2) Паттерны представления (layout/table/dialog shell)

| Артикул | Наименование | Цвета (основные токены) | Размеры | Отступы / ритм |
|---------|--------------|--------------------------|---------|----------------|
| `FIXED-LAYOUT-001` | Стабильный layout CRUD | `--card`, `--border`, `--background`, `--muted-foreground` | `table-min-height: 300px`, `card-min-height: 180px`, modal `max-height: 80vh` | страницы: `spacing-3/4`; таблицы и детали по `spacing-2/3` |
| `ACTIONS-STATE-002` | Действия в строке + баннеры | warning mix от `--accent`; danger mix от `--danger` | sticky `thead`/`pagination`; адаптивные actions | баннеры `spacing-3`, actions gap `spacing-2` |
| `SLOT-003` | Слоты body/header/footer | inherited from component tokens | зависит от host-компонента (`card/dialog`) | контент всегда в `slot="body"` |
| `VIEWPORT-FLUID-015` | Полноширинный экран-контейнер | глобальные токены темы (`background/foreground`) | root-контейнеры без `max-width` | main padding по `spacing-4` (`spacing-3` mobile) |

### 3) Список базовых цветовых токенов (обязательный минимум)

- Поверхности: `--background`, `--card`, `--card-foreground`, `--border`
- Текст и вторичный текст: `--foreground`, `--muted-foreground`
- Действия: `--primary`, `--primary-hover`, `--secondary`, `--secondary-hover`
- Состояния: `--danger`, `--danger-hover`, `--accent`, `--ghost-hover`
- Overlay/focus: `--overlay-backdrop`, `--overlay-backdrop-strong`, `--outline`

### 4) Размерный минимум (обязательный минимум)

- Типографика: `font-size-sm: 12`, `base: 14`, `lg: 16`
- Шкала отступов: `spacing-1: 4`, `2: 6`, `3: 8`, `4: 12`
- Радиусы: `radius-sm: 4`, `radius-md: 6`
- Кнопки: `28 / 34 / 40` (`sm/md/lg`)
- Input: `30 / 36 / 42` (`sm/md/lg`)
- Диалоги: `sm/md/lg/xl` (по правилам `dialog.component.scss`)

### 5) DoD для новой темы (обязательно, без пропусков)

Если добавляется новое "животное" (палитра), задача считается завершённой только если выполнены **все** пункты:

1. **Токены:** добавлен блок темы в `libs/design-tokens/src/styles/tokens.scss` (тот же набор `clr-01..clr-19` через CSS variables).
2. **Переключатель:** в header (`apps/web/src/app/app.ts`) добавлен пункт в `<select>` и логика применения класса на `documentElement`.
3. **Сохранение:** `localStorage('theme')` понимает новое значение и корректно восстанавливает его при загрузке.
4. **UI-таблица:** в `/ui` заполнена колонка новой темы в таблице цветов (без `—` в строках `clr-01..clr-19`).
5. **Архитектурная синхронизация:** обновлены `EVE_ARCH_INDEX.md` (строка `THEME-012`) и при необходимости раздел `ARCHITECTURE.md#theme-dark`.
6. **Смок-проверка:** переключение темы визуально меняет header, карточки, таблицы и модальные подложки.

## Процесс для ИИ / ревью

1. PR с новым визуальным примитивом: есть ли он в **ui-kit** или в **catalog-crud-patterns**?  
2. Обновлён ли **UI-каталог**?  
3. Если менялись правила слоёв — одна строка в **`ARCHITECTURE.md`** или в этом файле.
4. Для каскадных модалок проверить сценарий: `родитель` -> `+` -> `Сохранить` во вложенной форме. Родитель не закрывается, пока пользователь явно не сохраняет/отменяет его сам.
5. Для модалок проверить, что используется один из вариантов `sm/md/lg/xl`, а не локальный «уникальный» размер без причины.

Так мы не «насоздаём в фичах и забудем в каталоге».


---

**Синхронизация:** при правках кода по паттернам Eve-Arch обновляй связанные разделы — [DOCS_SYNC_RULES.md](./DOCS_SYNC_RULES.md) · [EVE_ARCH_INDEX.md](./EVE_ARCH_INDEX.md)
