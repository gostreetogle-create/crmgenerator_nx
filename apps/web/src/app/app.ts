// Eve-arch: VIEWPORT-FLUID-015 — корневой контейнер экрана на всю ширину viewport
// Eve-arch: THEME-012 — глобальный селектор темы в header + class (`dark`/`eagle`) на documentElement
// Eve-UX: UX-FEEDBACK-002 — ненавязчивый feedback: до toast/snackbar — баннеры на страницах фич (см. EVE_UX_INDEX)
import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
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
          <a class="app-header-nav-link" routerLink="/ui" routerLinkActive="app-header-nav-link--active">
            UI
          </a>
          <a
            class="app-header-nav-link"
            routerLink="/demo-feature"
            routerLinkActive="app-header-nav-link--active"
          >
            Demo
          </a>
          <label class="theme-select-wrap" for="theme-select">
            <span class="sr-only">Тема интерфейса</span>
            <select
              id="theme-select"
              class="theme-select"
              [value]="theme()"
              (change)="onThemeChange($event)"
              aria-label="Выбор темы интерфейса"
            >
              <option value="light">Лев</option>
              <option value="dark">Пантера</option>
              <option value="eagle">Орёл</option>
            </select>
          </label>
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
      background: color-mix(in oklch, var(--card) 90%, var(--background));
      box-shadow: var(--shadow-sm);
      backdrop-filter: blur(6px);
    }

    .app-header-inner {
      width: 100%;
      margin: 0;
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
      overflow-x: auto;
      scrollbar-width: thin;
      padding-bottom: 2px;
    }

    .app-header-nav-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 30px;
      border-radius: var(--radius-sm);
      padding: var(--spacing-1) var(--spacing-2);
      text-decoration: none;
      color: var(--foreground);
      font-size: var(--font-size-sm);
      border: 1px solid var(--border);
      background: var(--card);
      white-space: nowrap;
      box-sizing: border-box;
      transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
    }

    .app-header-nav-link:hover {
      background: color-mix(in oklch, var(--ghost-hover) 80%, var(--card));
      border-color: color-mix(in oklch, var(--primary) 30%, var(--border));
      transform: translateY(-1px);
    }

    .app-header-nav-link:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .app-header-nav-link--active {
      background: color-mix(in oklch, var(--primary) 12%, transparent);
      border-color: color-mix(in oklch, var(--primary) 35%, var(--border));
      box-shadow: inset 0 -1px 0 0 var(--primary), 0 1px 0 color-mix(in oklch, var(--primary) 20%, transparent);
      color: color-mix(in oklch, var(--foreground) 88%, var(--primary));
    }

    .app-header-actions {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .theme-select-wrap {
      display: inline-flex;
      align-items: center;
    }

    .theme-select {
      min-height: 30px;
      min-width: 92px;
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--foreground);
      font-size: var(--font-size-sm);
      line-height: 1.2;
      cursor: pointer;
      box-sizing: border-box;
    }

    .theme-select:hover {
      border-color: color-mix(in oklch, var(--primary) 30%, var(--border));
      background: color-mix(in oklch, var(--ghost-hover) 80%, var(--card));
    }

    .theme-select:focus-visible {
      outline: 2px solid var(--outline);
      outline-offset: 1px;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .app-main {
      padding: var(--spacing-4);
      max-width: none;
      margin: 0;
      min-height: calc(100vh - 76px);
      width: 100%;
      box-sizing: border-box;
    }

    @media (max-width: 900px) {
      .app-header {
        padding: 0 var(--spacing-3);
      }

      .app-header-inner {
        justify-content: flex-start;
      }

      .app-header-nav {
        order: 3;
        flex: 1 1 100%;
        justify-content: flex-start;
        padding-top: var(--spacing-1);
      }

      .app-main {
        padding: var(--spacing-3);
      }
    }
  `,
})
export class AppComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly theme = signal<'light' | 'dark' | 'eagle'>('light');

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    const stored = this.safeGetTheme();
    this.applyTheme(stored);
  }

  onThemeChange(event: Event) {
    const raw = (event.target as HTMLSelectElement).value;
    const value: 'light' | 'dark' | 'eagle' =
      raw === 'dark' ? 'dark' : raw === 'eagle' ? 'eagle' : 'light';
    this.applyTheme(value);
  }

  private applyTheme(next: 'light' | 'dark' | 'eagle') {
    this.theme.set(next);
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      document.documentElement.classList.toggle('dark', next === 'dark');
      document.documentElement.classList.toggle('eagle', next === 'eagle');
      window.localStorage.setItem('theme', next);
    } catch {
      // ignore localStorage/DOM access errors
    }
  }

  private safeGetTheme(): 'light' | 'dark' | 'eagle' {
    try {
      const raw = window.localStorage.getItem('theme');
      if (raw === 'dark') return 'dark';
      if (raw === 'eagle') return 'eagle';
      return 'light';
    } catch {
      return 'light';
    }
  }
}
