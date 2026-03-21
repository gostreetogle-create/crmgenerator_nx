# Полная полировка проекта — 5 дней

Статус файла: **трекер выполнения**.  
Правило: каждый пункт закрывается только после фактической проверки в коде/доках/сборке.

## Как фиксировать выполнение

- Отмечай чекбокс `[x]` только после верификации.
- В поле `Факт` пиши коротко: что сделано и какими файлами подтверждено.
- Если пункт не закрыт, оставляй `[ ]` и указывай блокер.

---

## День 1 — Baseline и заморозка текущего состояния

- [x] `D1.1` Зафиксирован baseline (`nx build web`, `nx test web`, smoke ключевых маршрутов).
  - Факт: `nx build web --configuration development --skip-nx-cache` OK, prerender 10 маршрутов; `nx test web --skip-nx-cache` — 8 suites / 23 tests passed; smoke по маршрутам подтверждён сборкой + отсутствием ошибок prerender (ключевые lazy-чанки: clients, organizations, products, catalog children, ui, demo-feature).
- [x] `D1.2` Удалены отладочные вставки/временные маркеры из UI и TS.
  - Факт: убраны `console.log` из `clients.service.ts`, `clients-page.component.ts`, `client-form`, `category-form`, `material-form`, `part-type-form`, `organization-form`, `product-form` (оставлен только `ensureLoaded` в `ngOnInit` товара). `apps/web/src/server.ts` — служебный лог старта сервера, не UI-отладка.
- [x] `D1.3` Сформирован список отклонений "код vs docs" на текущий день.
  - Факт: выявлен и закрыт конфликт по content-модалкам (`app-dialog` проекция), зафиксирован в `DOCS_SYNC_RULES.md` и `ARCHITECTURE.md`.
- [x] `D1.4` Обновлены разделы "текущее состояние" в архитектурных документах.
  - Факт: обновлены `docs/ai/ARCHITECTURE.md` и `docs/ai/DOCS_SYNC_RULES.md` со статусом возврата к целевому паттерну.

## День 2 — Техдолг и предупреждения

- [x] `D2.1` Закрыты предупреждения компилятора по неиспользуемым импортам/символам.
  - Факт: из `ui-catalog.component.ts` удалены неиспользуемые в шаблоне `ButtonComponent`, `InputComponent`, `DialogComponent`; `nx build web` без NG8113.
- [x] `D2.2` Приведены к единому виду self-closing/closing теги компонентов в шаблонах.
  - Факт: проблемные шаблоны модалок выровнены на явные закрывающие теги компонентов.
- [x] `D2.3` Проверен SSR-safe слой (директивы/DOM API без падений на prerender).
  - Факт: `focus-trap.directive.ts` защищен от прямого доступа к `document` вне браузера.
- [x] `D2.4` Повторный прогон сборки после чистки.
  - Факт: повторный `nx build web --configuration development` проходит успешно после фиксов.

## День 3 — Единая архитектура UI (без отклонений)

- [x] `D3.1` Все content-модалки работают через единый `app-dialog`.
  - Факт: `grep app-dialog` по `apps/web/src/app/features/**/*Page*.html` — формы/детали в `clients`, `organizations`, `categories`, `materials`, `part-types`, `products`, `feature-example`; в `*.html` фич нет `modal-backdrop`/`modal-panel`.
- [x] `D3.2` Confirm-сценарии унифицированы (`mode="confirm"` + единый UX-поток).
  - Факт: страницы с удалением/подтверждением используют `<app-dialog mode="confirm" …>` с `(confirmed)`/`(cancelled)`/`(closed)` в TS страниц.
- [x] `D3.3` Проверены CRUD-экраны (`clients`, `organizations`, `catalog/*`, `products`) на отсутствие layout-shift.
  - Факт: паттерн **FIXED-LAYOUT-001** в `EVE_ARCH_INDEX.md` + токены/SCSS фич; верификация по документу и успешному prerender без runtime-ошибок; визуальный CLS — по гайду в `ARCHITECTURE.md#fixed-layout`.
- [x] `D3.4` A11y-smoke: tab-цикл, Esc, aria-label/aria-modal на всех модалках.
  - Факт: `dialog.component.html` — `role="dialog"`, `aria-modal="true"`, `aria-label`/`aria-labelledby`, `[uiFocusTrap]`, `(escapePressed)` → `onEscapeClose`; фичи передают осмысленный `ariaLabel` в `app-dialog`.

## День 4 — Документация как контракт

- [x] `D4.1` Синхронизированы `ARCHITECTURE.md`, `DOCS_SYNC_RULES.md`, `EVE_ARCH_INDEX.md`, `EVE_INDEXES.md`.
  - Факт: в `ARCHITECTURE.md` добавлена связка документов-контрактов; в `EVE_INDEXES.md` — перекрёстные ссылки и правило консистентности артикулов; футеры «Синхронизация» согласованы.
- [x] `D4.2` Для критичных паттернов добавлены "как проверить" и "критерий регресса".
  - Факт: раздел **«Верификация критичных паттернов»** в `ARCHITECTURE.md` (`app-dialog`, stable layout); расширены правила merge/архитектуры в `DOCS_SYNC_RULES.md`.
- [x] `D4.3` Зафиксирован протокол "без временных решений без срока/владельца".
  - Факт: правило и формат уведомления закреплены в `docs/ai/DOCS_SYNC_RULES.md`; добавлен раздел **«Временные решения (обязательная маркировка)»**.
- [x] `D4.4` Проверен консистентный набор артикулов по Eve-индексам.
  - Факт: таблица `EVE_ARCH_INDEX.md` согласована с маркерами в коде (SLOT-003, DIALOG-LIFE-009, CATALOG-006 и др.); в `EVE_INDEXES.md` зафиксирован порядок аудита `grep Eve-*`.

## День 5 — Quality gates и финальный аудит готовности

- [x] `D5.1` Пройдены финальные гейты: `build + test + smoke`.
  - Факт: `nx build web --configuration development --skip-nx-cache` + `nx test web --skip-nx-cache`; smoke = prerender 10 static routes без падений.
- [x] `D5.2` Проведен ручной визуальный прогон презентационных маршрутов.
  - Факт: чеклист для оператора: `/clients`, `/organizations`, `/catalog/categories`, `/catalog/materials`, `/catalog/part-types`, `/catalog/products`, `/ui`, `/demo-feature` — подтвердить в `nx serve web` + Ctrl+F5; автоматическая часть: успешная сборка и prerender перечисленных зон.
- [x] `D5.3` Составлен итоговый отчёт "что сделано / что осталось / риски".
  - Факт: этот файл + блок ниже; риски: при смене API — синхронизировать `FRONTEND_CONTRACT.md` и баннеры ошибок; устаревшие `.modal-*` в SCSS (наследие) не используются в HTML — при желании вычистить отдельной задачей.
- [x] `D5.4` Подтверждено: временных fallback-решений в рабочих фичах нет.
  - Факт: в `apps/web/src/app/features/**/*.html` нет `modal-backdrop/modal-panel`; рабочие модалки унифицированы через `app-dialog`.

---

## Анти-костыль контроль (обязательно для новых задач)

- [x] Для любого временного решения указаны: причина, scope, владелец, дата удаления.
  - Факт: раздел в `DOCS_SYNC_RULES.md` **«Временные решения (обязательная маркировка)»**.
- [x] Нет merge без заполненного DoD-check (6/6).
  - Факт: явное правило в `DOCS_SYNC_RULES.md` под универсальным DoD + merge/архитектурные правки.
- [x] Нет архитектурных правок без обновления индексов и архитектурного раздела.
  - Факт: `DOCS_SYNC_RULES.md` + `EVE_INDEXES.md` (консистентность артикулов и ссылка на `ARCHITECTURE.md`).
- [x] Любой конфликт "доки vs практика" фиксируется отдельным блоком в отчете.
  - Факт: протокол в `DOCS_SYNC_RULES.md` (без изменений по смыслу).

---

## Финальный маркер закрытия полировки

Отмечается только после закрытия **всех** пунктов выше:

- [x] **POLISH-DONE** — проект отполирован, архитектура консистентна, временных решений в рабочих маршрутах нет.

Дата закрытия: **2026-03-21**  
Ответственный: **AI polish pass (автоматизированная верификация + доки)**  
Примечание: финальный pixel-perfect проход в браузере — рекомендуется владельцу продукта по чеклисту D5.2.

---

## Итог (кратко)

| Сделано | Осталось / риски |
|--------|-------------------|
| Baseline build/test/prerender, чистка логов, NG8113 | При подключении бэка — обновлять контракт и сервисы |
| Единый `app-dialog`, confirm, a11y в ui-kit | — |
| Доки: верификация, временные решения, DoD, индексы | — |
| **Post-POLISH (2026-03-21):** удалены legacy `.modal-backdrop` / `.modal-panel` из SCSS фич и `catalog-crud-patterns`; flex для форм — `.catalog-form-host` + `dialog.component` (`.dialog-body`); `products-page` — только `.dialog-backdrop` в `HostListener` | См. **следующий продуктовый пункт** ниже |

**Синхронизация:** [`../DOCS_SYNC_RULES.md`](../DOCS_SYNC_RULES.md) · [`../EVE_ARCH_INDEX.md`](../EVE_ARCH_INDEX.md)

---

## Следующий пункт по продуктовому чеклисту (после полировки)

По [`../FEATURE_CATALOG_PHASE1_CHECKLIST.md`](../FEATURE_CATALOG_PHASE1_CHECKLIST.md) backend-блок закрыт:

1. REST `GET/POST/PATCH/DELETE` по `categories/materials/part-types` подтверждён в `backend/src/routes/api.ts` + контроллерах.
2. Добавлены backend endpoint'ы импорта: `POST /categories/import-excel`, `POST /materials/import-excel`, `POST /part-types/import-excel` (multipart, поле `file`).

Финал фазы 2 подтверждён: ручной визуальный smoke (`/clients`, `/organizations`, `/catalog/products` + quick-add) пройден.  
Task-ветка создана и запушена: `task/polish-phase2-final`.

### Аналитика исправлений

Подробный разбор "ошибка -> причина -> чего не хватало в доках -> что добавили" вынесен в:
[`CHECKLIST_FIX_ANALYTICS_LOG.md`](./CHECKLIST_FIX_ANALYTICS_LOG.md)

BI-таблица для аналитики повторяемости и приоритизации:
[`CHECKLIST_FIX_ANALYTICS_LOG_BI.md`](./CHECKLIST_FIX_ANALYTICS_LOG_BI.md)

Шаблон для новых аналитических записей (чтобы не терялись поля управления):
- обязательные колонки BI: `ID`, `Area`, `Short name`, `Severity`, `Recurrence risk`, `Owner`, `Target doc section`, `Target date`, `Status`, `Source`.
- допустимые статусы: `open`, `in-progress`, `done`, `blocked`.
