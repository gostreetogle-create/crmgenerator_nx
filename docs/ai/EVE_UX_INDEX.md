# Eve-UX Index

Интерфейс: анимации, подтверждения, обратная связь (включая toast), фокус и клавиатура в модалках.

## Порядок работы

Перед правкой UX поведения оверлеев, сообщений пользователю или фокуса — **`grep Eve-UX`**.

## Таблица

| Артикул | Название | Описание | Файлы | Docs-link |
|---------|----------|----------|-------|-----------|
| **UX-ANIM-001** | Подтверждение опасного действия | Диалог подтверждения (`mode="confirm"`), тексты/title/message, кнопки Подтвердить/Отмена, `danger` для удаления; единый `app-dialog`, не локальные `window.confirm` в фичах. | `libs/ui-kit/src/lib/dialog/dialog.component.{ts,html,scss}`; CRUD-страницы с `mode="confirm"`; демо в `ui-catalog.component.html` | [ARCHITECTURE — dialog-life + анимации](./ARCHITECTURE.md#dialog-life) |
| **UX-FEEDBACK-002** | Toast / ненавязчивый feedback | Короткие успех/ошибка вне модалки (планируемый слой toast/snackbar). **Сейчас:** списочные баннеры `state-banner` / `list-state` на CRUD до внедрения toast. | *После внедрения:* `libs/ui-kit/...` + сервис в `apps/web`; *сейчас:* `clients-page` и аналоги | [ARCHITECTURE — actions-state](./ARCHITECTURE.md#actions-state) · [Eve-arch ACTIONS-STATE-002](./EVE_ARCH_INDEX.md) |
| **UX-ACCESS-003** | Focus-trap в overlay | Удержание Tab/Shift+Tab внутри активного диалога; опционально Esc → `escapePressed`; подключение `[uiFocusTrap]` на панели модалки. | `libs/ui-kit/src/lib/focus-trap/focus-trap.directive.ts`; `libs/ui-kit/src/lib/dialog/dialog.component.html` | [ARCHITECTURE — a11y-ui-kit](./ARCHITECTURE.md#a11y-ui-kit) |

---

**Синхронизация:** [`DOCS_SYNC_RULES.md`](./DOCS_SYNC_RULES.md) · [`EVE_INDEXES.md`](./EVE_INDEXES.md)

**Презентация / аудит:** проверка модалок — backdrop, `aria-modal`, focus-trap (`UX-ACCESS-003`); опасные действия — только `app-dialog` confirm (`UX-ANIM-001`).
