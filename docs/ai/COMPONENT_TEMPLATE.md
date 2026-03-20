# COMPONENT_TEMPLATE

Короткий чек-лист для создания UI-компонента в `ui-kit`.  
Для агентов: промпт **P4** в `docs/PROMPTS.md`, общий процесс — `docs/ai/AI_PROJECT_PLAYBOOK.md`.

- Команда: `nx g @nx/angular:component --project=ui-kit --style=scss --standalone --export`
- `encapsulation: ViewEncapsulation.None`
- Импорт: `@import "@design-tokens/styles/tokens";` в `.scss`
- Классы: на реальном элементе, через `[class]="computedClasses()"`
- Цвета/тени/шрифты: только `var(--...)` из tokens
- **UI-каталог:** после добавления компонента — демо в `apps/web/src/app/features/ui-catalog/` и правило в `docs/ai/UI_CATALOG_AND_DESIGN_SYSTEM.md`.
- Тест: `nx serve web` + `Ctrl+F5` — видно ли изменения?
- Линтинг: `npm run ui:lint`
