import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterOutlet],
  selector: 'app-root',
  template: `
    <header class="app-header">
      <a routerLink="/clients">Заказчики</a>
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
