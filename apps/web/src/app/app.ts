import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UiCatalogComponent } from './features/ui-catalog/ui-catalog.component';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet, UiCatalogComponent],
  selector: 'app-root',
  template: `
    <header class="app-header">
      <div class="app-header-inner">
        <a routerLink="/" class="app-header-brand">CRM Generator</a>
        <nav class="app-header-nav" aria-label="Основная навигация">
          <a
            class="app-header-nav-link"
            routerLink="/clients"
            routerLinkActive="app-header-nav-link--active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Заказчики
          </a>
          <a
            class="app-header-nav-link"
            routerLink="/organizations"
            routerLinkActive="app-header-nav-link--active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Организации
          </a>
          <a
            class="app-header-nav-link"
            routerLink="/catalog/categories"
            routerLinkActive="app-header-nav-link--active"
            [routerLinkActiveOptions]="{ exact: false }"
          >
            Категории
          </a>
          <a
            class="app-header-nav-link"
            routerLink="/catalog/materials"
            routerLinkActive="app-header-nav-link--active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Материалы
          </a>
          <a
            class="app-header-nav-link"
            routerLink="/catalog/part-types"
            routerLinkActive="app-header-nav-link--active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Типы деталей
          </a>
          <a
            class="app-header-nav-link"
            routerLink="/catalog/products"
            routerLinkActive="app-header-nav-link--active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Товары
          </a>
        </nav>
        <div class="app-header-actions">
          <app-ui-catalog />
        </div>
      </div>
    </header>
    <main class="app-main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: `
    .app-header {
      position: sticky;
      top: 0;
      z-index: 40;
      padding: 0 var(--spacing-4);
      border-bottom: 1px solid var(--border);
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }

    .app-header-inner {
      max-width: 1400px;
      margin: 0 auto;
      min-height: 56px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-2) var(--spacing-3);
      padding: var(--spacing-2) 0;
    }

    .app-header-brand {
      flex-shrink: 0;
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      color: var(--foreground);
      text-decoration: none;
      letter-spacing: 0.02em;
    }

    .app-header-brand:hover {
      color: var(--primary);
    }

    .app-header-brand:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    .app-header-nav {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      flex: 1;
      justify-content: center;
      min-width: 0;
    }

    .app-header-nav-link {
      display: inline-flex;
      align-items: center;
      border-radius: var(--radius-sm);
      padding: var(--spacing-1) var(--spacing-2);
      text-decoration: none;
      color: var(--foreground);
      font-size: var(--font-size-sm);
      border: 1px solid transparent;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .app-header-nav-link:hover {
      background: var(--ghost-hover);
    }

    .app-header-nav-link:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .app-header-nav-link--active {
      background: color-mix(in oklch, var(--primary) 12%, transparent);
      border-color: color-mix(in oklch, var(--primary) 35%, var(--border));
      box-shadow: inset 0 -1px 0 0 var(--primary);
    }

    .app-header-actions {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .app-main {
      padding: var(--spacing-4);
      max-width: 1400px;
      margin: 0 auto;
      min-height: calc(100vh - 76px);
      width: 100%;
      box-sizing: border-box;
    }
  `,
})
export class AppComponent {}
