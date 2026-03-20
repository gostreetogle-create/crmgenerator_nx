# Eve-SEC Index

Безопасность: секреты, заголовки, XSS, доверие к API, хранение токенов.

## Порядок работы

Перед изменениями API, env, хранилища или пользовательского HTML — **`grep Eve-SEC`**. Новый артикул — таблица ниже, в коде `// Eve-SEC: <CODE> — …`.

## Таблица

| Артикул | Название | Описание | Файлы | Docs-link |
|---------|----------|----------|-------|-----------|
| **SEC-ENV-API-001** | База API из environment | `apiBaseUrl` задаётся в `environment*.ts` / CI, не из пользовательского ввода; interceptor берёт только `APP_ENVIRONMENT`. | `apps/web/src/environments/environment.ts`; `environment.development.ts`; `app.config.ts`; `core/api/api-base-url.interceptor.ts` | [`docs/api/FRONTEND_CONTRACT.md`](../api/FRONTEND_CONTRACT.md) · [ARCHITECTURE — api-base-url](./ARCHITECTURE.md#api-base-url) |

---

**Синхронизация:** [`DOCS_SYNC_RULES.md`](./DOCS_SYNC_RULES.md) · [`EVE_INDEXES.md`](./EVE_INDEXES.md)

**Презентация / аудит:** не коммитить `.env` с секретами; для демо бэка — только доверенный `apiBaseUrl`.
