# Eve-Arch Index

Реестр **структурных** паттернов проекта (layout, API, роутинг, слоты). Расширенные индексы BL / UX / PERF / SEC — **[`EVE_INDEXES.md`](./EVE_INDEXES.md)** (`Eve-BL`, `Eve-UX`, `Eve-PERF`, `Eve-SEC`).

## Порядок работы (любой фикс / фича)

1. **Сначала** — поиск по проекту: **`grep Eve-arch`** (или эквивалент в IDE).
2. **Подходит существующий паттерн** — используй его и те же файлы/подход (пример: высоты и стабильный layout → **`FIXED-LAYOUT-001`**). Не вводи второй артикул на ту же идею.
3. **Не подходит** — заведи **новый** артикул вида **`CATEGORY-NNN`** (например `GRID-016`): добавь строку в таблицу ниже (**название, описание, файлы, дата, Docs-link**), в затронутом коде маркер:
   - **TS/SCSS:** `// Eve-arch: GRID-016 — кратко`
   - **HTML:** `<!-- Eve-arch: GRID-016 — кратко -->`
4. **«Просто код» без устойчивого паттерна** — **никогда не оставляй правку без маркера**: ставь **`000`** (`// Eve-arch: 000 — …`).
5. Запрос **«по всему сайту» / глобально** — **обязательно** снова **`grep Eve-arch`**, затем либо разнести существующий паттерн по всем релевантным местам, либо обнови индекс и маркеры согласованно.

## Правила оформления

- Новый паттерн → код **`CATEGORY-NNN`**, строка в таблице, дата = день фикса, **Docs-link** на якорь в `ARCHITECTURE.md` или чек-листе фичи.
- Маркеры в коде:
  - **TS/SCSS:** `// Eve-arch: CODE — кратко`
  - **HTML-шаблоны:** `<!-- Eve-arch: CODE — кратко -->` (в Angular в `.html` нельзя `//`)

## Таблица

| Артикул | Название | Описание | Файлы | Дата | Docs-link |
|---------|----------|----------|-------|------|-----------|
| **FIXED-LAYOUT-001** | Фиксированный layout карточек/таблиц/модалок | `min-height` из токенов, flex-колонка у карточки, `.table-wrap` + таблица с устойчивыми границами, модалка с предсказуемой высотой — без «прыжков» и layout shift. | `libs/design-tokens/.../tokens.scss`; `ui-kit` card/dialog SCSS; `clients-page.component.scss`; `organizations-page.component.scss`; `catalog-shared/catalog-crud-page.scss`; `catalog-shared/catalog-crud-patterns.scss`; `categories|materials|part-types|products-page.component.scss` | 2026-03-19 | [ARCHITECTURE — fixed-layout](./ARCHITECTURE.md#fixed-layout) |
| **ACTIONS-STATE-002** | Действия в строке + баннеры состояния | Три кнопки «Действия» (`ghost` / `secondary` / `danger`, `app-button` + `sm`); `list-state`, `state-banner`, Retry/Hide. | `clients-page.component.html`; `organizations-page.component.html`; `categories-page.component.html`; `materials-page.component.html`; `part-types-page.component.html`; `products-page.component.html` | 2026-03-19 | [ARCHITECTURE — actions-state](./ARCHITECTURE.md#actions-state) |
| **SLOT-003** | Слот body для Card/Dialog | Контент в `<div slot="body">`; в ui-kit — `ng-content select="[slot=body]"` + fallback. | `card.component.html`, `dialog.component.html`; `clients|organizations|categories|materials|part-types|products-page.component.html`; `ui-catalog.component.html` | 2026-03-19 | [ARCHITECTURE — slot-body](./ARCHITECTURE.md#slot-body) |
| **ROUTES-004** | Централизованный routing map | Единая карта standalone + вложенный каталог; чанки фич — см. **PERF-LAZY-ROUTES-001**. | `app.routes.ts`; `catalog-shell.component.ts` | 2026-03-20 | [ARCHITECTURE — routes-map](./ARCHITECTURE.md#routes-map) |
| **API-005** | Base URL interceptor | Относительные пути → префикс `apiBaseUrl`. | `api-base-url.interceptor.ts` | 2026-03-20 | [ARCHITECTURE — api-base-url](./ARCHITECTURE.md#api-base-url) |
| **CATALOG-006** | UI-каталог как источник правды | `catalogGroups`, `dialogArticles` в ui-catalog. | `ui-catalog.component.ts` | 2026-03-20 | [ARCHITECTURE — ui-catalog](./ARCHITECTURE.md#ui-catalog) |
| **INPUT-007** | Универсальный Input API | `app-input`: variant/size, hint/error/a11y. | `input.component.ts` | 2026-03-20 | [ARCHITECTURE — input-api](./ARCHITECTURE.md#input-api) |
| **QUERY-008** | URL-state синхронизация списка | Поиск/сорт/страница ↔ query params. | `clients-page.component.ts`; `organizations-page.component.ts`; `categories-page.component.ts`; `materials-page.component.ts`; `part-types-page.component.ts`; `products-page.component.ts` | 2026-03-20 | [FEATURE_CLIENTS — query-url-state](./FEATURE_CLIENTS_CHECKLIST.md#query-url-state) |
| **DIALOG-LIFE-009** | Lifecycle диалога + анимации | `open`, delayed unmount, события; миксины enter/exit/backdrop. | `dialog.component.ts`, `animations.scss` | 2026-03-20 | [ARCHITECTURE — dialog-life + анимации](./ARCHITECTURE.md#dialog-life) |
| **THEME-012** | Переключение light/dark | `localStorage` + класс `dark` на `documentElement`. | `ui-catalog.component.ts` | 2026-03-20 | [ARCHITECTURE — theme-dark](./ARCHITECTURE.md#theme-dark) |
| **A11Y-013** | Базовая доступность | aria-атрибуты, focus в ui-kit. | `input`, `dialog` | 2026-03-20 | [ARCHITECTURE — a11y-ui-kit](./ARCHITECTURE.md#a11y-ui-kit) |
| **FORMS-014** | Сигнальные формы + effect-init | `formData` через `effect` от `input()`, `output` наружу. | `*-form.component.ts` | 2026-03-20 | [ARCHITECTURE — forms-signal-effect](./ARCHITECTURE.md#forms-signal-effect) |
| **000** | Без выделенного паттерна | Вспомогательный файл без устойчивого паттерна. | точечно в `apps/`, `libs/` | 2026-03-20 | [DOCS_SYNC_RULES](./DOCS_SYNC_RULES.md) |

---

**Статус: готов к использованию; индекс готов к росту** (новые артикулы — по разделу «Порядок работы» выше).

Связь: [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`DIAGNOSTIC_CHECKLIST.md`](./DIAGNOSTIC_CHECKLIST.md), [`DOCS_SYNC_RULES.md`](./DOCS_SYNC_RULES.md).

---

**Синхронизация:** при правках кода по паттернам Eve-Arch обновляй связанные разделы — [`DOCS_SYNC_RULES.md`](./DOCS_SYNC_RULES.md) · этот файл (`EVE_ARCH_INDEX.md`)

**Презентация / аудит:** `grep Eve-arch` после правок по всему сайту; смоки — `nx serve web`, `nx test web`.
