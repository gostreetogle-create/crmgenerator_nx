# Eve-PERF Index

Производительность: бандл, change detection, виртуализация списков, кэширование, ленивая загрузка.

## Порядок работы

Перед оптимизацией рендера или загрузки — **`grep Eve-PERF`**. Новый артикул — таблица ниже, в коде `// Eve-PERF: <CODE> — …`.

## Таблица

| Артикул | Название | Описание | Файлы | Docs-link |
|---------|----------|----------|-------|-----------|
| **PERF-LAZY-ROUTES-001** | Lazy-loaded страницы | `loadComponent` для фич-маршрутов: меньше initial bundle, чанки под clients/orgs/ui/catalog/*. | `apps/web/src/app/app.routes.ts` | [ARCHITECTURE — routes-map](./ARCHITECTURE.md#routes-map) · [EVE_ARCH — ROUTES-004](./EVE_ARCH_INDEX.md) |

---

**Синхронизация:** [`DOCS_SYNC_RULES.md`](./DOCS_SYNC_RULES.md) · [`EVE_INDEXES.md`](./EVE_INDEXES.md)

**Презентация / аудит:** после изменений маршрутов — `nx build web` (размер чанков), `nx test web`.
