import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UiCatalogComponent } from './features/ui-catalog/ui-catalog.component';

@Component({
  imports: [RouterLink, RouterOutlet, UiCatalogComponent],
  selector: 'app-root',
  template: `
    <header class="app-header">
      <a routerLink="/clients">Заказчики</a>
      <app-ui-catalog />
    </header>
    <main class="app-main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: `
    .app-header {
      padding: var(--spacing-2) var(--spacing-3);
      border-bottom: 1px solid var(--border);
      font-size: var(--font-size-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-2);
    }
    .app-header a {
      color: var(--foreground);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
    }
    .app-main {
      padding: var(--spacing-2);
    }
  `,
})
export class AppComponent {}
