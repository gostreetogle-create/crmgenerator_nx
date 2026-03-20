import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ButtonComponent } from '@ui-kit/button';
import { UiCatalogComponent } from './features/ui-catalog/ui-catalog.component';

@Component({
  imports: [RouterLink, RouterOutlet, ButtonComponent, UiCatalogComponent],
  selector: 'app-root',
  template: `
    <header class="app-header">
      <div class="app-header-inner">
        <a routerLink="/" class="app-header-brand">CRM Generator</a>
        <nav class="app-header-nav" aria-label="Основная навигация">
          <span
            class="app-header-nav-item"
            [class.app-header-nav-item--active]="isNavActive('/clients')"
          >
            <app-button variant="ghost" size="sm" (clicked)="navigate('/clients')">
              Заказчики
            </app-button>
          </span>
          <span
            class="app-header-nav-item"
            [class.app-header-nav-item--active]="isNavActive('/organizations')"
          >
            <app-button variant="ghost" size="sm" (clicked)="navigate('/organizations')">
              Организации
            </app-button>
          </span>
          <span
            class="app-header-nav-item"
            [class.app-header-nav-item--active]="isNavActive('/catalog/categories')"
          >
            <app-button variant="ghost" size="sm" (clicked)="navigate('/catalog/categories')">
              Категории
            </app-button>
          </span>
          <span
            class="app-header-nav-item"
            [class.app-header-nav-item--active]="isNavActive('/catalog/materials')"
          >
            <app-button variant="ghost" size="sm" (clicked)="navigate('/catalog/materials')">
              Материалы
            </app-button>
          </span>
          <span
            class="app-header-nav-item"
            [class.app-header-nav-item--active]="isNavActive('/catalog/part-types')"
          >
            <app-button variant="ghost" size="sm" (clicked)="navigate('/catalog/part-types')">
              Типы деталей
            </app-button>
          </span>
          <span
            class="app-header-nav-item"
            [class.app-header-nav-item--active]="isNavActive('/catalog/products')"
          >
            <app-button variant="ghost" size="sm" (clicked)="navigate('/catalog/products')">
              Товары
            </app-button>
          </span>
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

    .app-header-nav-item {
      display: inline-flex;
      border-radius: var(--radius-sm);
    }

    .app-header-nav-item--active {
      background: color-mix(in oklch, var(--primary) 12%, transparent);
      box-shadow: inset 0 -2px 0 0 var(--primary);
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
export class AppComponent {
  private readonly router = inject(Router);

  navigate(path: string): void {
    void this.router.navigateByUrl(path);
  }

  /** Активный пункт меню (префикс пути, без query). */
  isNavActive(route: string): boolean {
    const tree = this.router.parseUrl(this.router.url);
    const parts = (tree.root.children['primary']?.segments ?? []).map((s) => s.path);
    const want = route.replace(/^\//, '').split('/').filter(Boolean);
    if (!want.length) return false;
    return want.every((seg, i) => parts[i] === seg);
  }
}
