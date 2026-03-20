# Сторож: синхронизация документации с кодом

## Eve-Arch в коде

При любом изменении, где фигурирует маркер **`Eve-arch: <ARTICLE>`** или семейства **`Eve-BL` / `Eve-UX` / `Eve-PERF` / `Eve-SEC` / `Eve-BE`** (или добавляется новый артикул):

1. Обнови строку в **`EVE_ARCH_INDEX.md`**, в нужном файле из **[`EVE_INDEXES.md`](./EVE_INDEXES.md)** (`EVE_BL_INDEX`, `EVE_UX_INDEX`, …) или в **[`EVE_BACKEND_INDEX.md`](./EVE_BACKEND_INDEX.md)** / `EVE_BE_*.md` для бэка.
2. Обнови **целевой раздел** по **Docs-link** — обычно **`ARCHITECTURE.md#…`**, либо чек-лист фичи / `docs/business/*` для BL.
3. Пример: **`FIXED-LAYOUT-001`** → [`ARCHITECTURE.md`](./ARCHITECTURE.md)`#fixed-layout`; **`UX-ACCESS-003`** → [`EVE_UX_INDEX.md`](./EVE_UX_INDEX.md) + [`ARCHITECTURE.md#a11y-ui-kit`](./ARCHITECTURE.md#a11y-ui-kit).

Если правка **не задаёт повторяемый паттерн**, в коде оставляй **`Eve-arch: 000`** и не раздуй индекс; при необходимости одной строкой отрази нюанс в **`DIAGNOSTIC_CHECKLIST.md`** или чек-листе фичи.

## Eve-BL (бизнес-логика)

При правках **CRUD, статусов, отправки, скидок, цепочек сущностей** — обязательный порядок: **`grep Eve-BL`** → переиспользование или новый артикул → **`EVE_BL_INDEX.md`** → маркер **`Eve-BL:`** в коде. Подробно: **[`EVE_BL_INDEX.md`](./EVE_BL_INDEX.md)** («Правило»).

## Глобальные формулировки («по всему сайту»)

Сначала поиск по репозиторию: **`grep -E "Eve-arch:|Eve-BL:|Eve-UX:|Eve-PERF:|Eve-SEC:|Eve-BE:"`** (или по отдельности), затем согласованно обнови код, индекс и раздел в **`ARCHITECTURE.md`** / чек-листах — см. **`EVE_ARCH_INDEX.md`**, **`EVE_INDEXES.md`**, при бэке — **`EVE_BACKEND_INDEX.md`**.

**Perf / Sec:** артикулы **`PERF-*`** — в [`EVE_PERF_INDEX.md`](./EVE_PERF_INDEX.md); **`SEC-*`** (фронт) — в [`EVE_SEC_INDEX.md`](./EVE_SEC_INDEX.md) (не путать с бэкендом **`Eve-BE:`** / `EVE_BE_SEC.md`).

## Футер в документах

В конце каждого `.md` под `docs/` — блок **«Синхронизация»** со ссылкой на этот файл, на **`EVE_ARCH_INDEX.md`** и при необходимости на **`EVE_INDEXES.md`** (относительные пути от каталога файла).

---

**Синхронизация:** при правках кода по паттернам Eve-* обновляй связанные разделы — этот файл · [`EVE_ARCH_INDEX.md`](./EVE_ARCH_INDEX.md) · [`EVE_INDEXES.md`](./EVE_INDEXES.md)

**Презентация / аудит:** после аудита по индексам — прогон тестов web + ui-kit и короткая запись в соответствующем `EVE_*_INDEX.md` при новых артикулах.
