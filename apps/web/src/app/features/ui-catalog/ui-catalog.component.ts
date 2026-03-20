import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { ButtonComponent } from '@ui-kit/button';
import { CardComponent } from '@ui-kit/card';
import { ConfirmDialogComponent } from '@ui-kit/confirm-dialog';
import { InputComponent } from '@ui-kit/input';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface CatalogItem {
  code: string;
  name: string;
  spanLabel?: string;
  variant?: ButtonVariant;
  subtitle?: string;
}

interface CatalogFooterColor {
  code: string;
  cssVar: string; // CSS custom property, e.g. '--background'
}

const BUTTONS: CatalogItem[] = [
  { code: 'b-01', name: 'Primary', spanLabel: 'Основная', variant: 'primary' },
  { code: 'b-02', name: 'Secondary', spanLabel: 'Вторичная', variant: 'secondary' },
  { code: 'b-03', name: 'Outline', spanLabel: 'Контурная', variant: 'outline' },
  { code: 'b-04', name: 'Danger', spanLabel: 'Опасная', variant: 'danger' },
  { code: 'b-05', name: 'Ghost', spanLabel: 'Призрачная', variant: 'ghost' },
];

const INPUTS: CatalogItem[] = [
  { code: 'i-01', name: 'Default input', spanLabel: 'Стандартный ввод' },
  { code: 'i-02', name: 'Input with error', spanLabel: 'Ввод с ошибкой' },
];

const CARDS: CatalogItem[] = [{ code: 'c-01', name: 'Default card', spanLabel: 'Карточка по умолчанию' }];

const CONFIRM_DIALOGS: CatalogItem[] = [
  { code: 'd-01', name: 'Danger confirm', spanLabel: 'Опасное подтверждение', subtitle: 'Удаление' },
];

const FOOTER_COLORS_BUTTONS: CatalogFooterColor[] = [
  { code: 'col-08', cssVar: '--outline' },
  { code: 'col-09', cssVar: '--primary' },
  { code: 'col-10', cssVar: '--primary-hover' },
  { code: 'col-11', cssVar: '--text-on-primary' },
  { code: 'col-12', cssVar: '--secondary' },
  { code: 'col-13', cssVar: '--secondary-hover' },
  { code: 'col-14', cssVar: '--danger' },
  { code: 'col-15', cssVar: '--danger-hover' },
  { code: 'col-16', cssVar: '--accent' },
  { code: 'col-17', cssVar: '--ghost-hover' },
];

const FOOTER_COLORS_INPUTS: CatalogFooterColor[] = [
  { code: 'col-01', cssVar: '--background' },
  { code: 'col-04', cssVar: '--foreground' },
  { code: 'col-05', cssVar: '--muted-foreground' },
  { code: 'col-06', cssVar: '--muted' },
  { code: 'col-07', cssVar: '--border' },
  { code: 'col-09', cssVar: '--primary' }, // focus
  { code: 'col-14', cssVar: '--danger' }, // error
];

const FOOTER_COLORS_CARDS: CatalogFooterColor[] = [
  { code: 'col-02', cssVar: '--card' },
  { code: 'col-03', cssVar: '--card-foreground' },
  { code: 'col-05', cssVar: '--muted-foreground' },
  { code: 'col-07', cssVar: '--border' },
  { code: 'col-09', cssVar: '--primary' }, // hover mix
];

const FOOTER_COLORS_CONFIRM: CatalogFooterColor[] = [
  { code: 'col-18', cssVar: '--overlay-backdrop' },
  { code: 'col-19', cssVar: '--overlay-backdrop-strong' },
  { code: 'col-04', cssVar: '--foreground' },
  { code: 'col-02', cssVar: '--card' },
  { code: 'col-07', cssVar: '--border' },
];

@Component({
  selector: 'app-ui-catalog',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './ui-catalog.component.html',
  styleUrl: './ui-catalog.component.scss',
})
export class UiCatalogComponent {
  readonly isOpen = signal(false);
  readonly showConfirmPreview = signal(false);
  private readonly platformId = inject(PLATFORM_ID);

  readonly theme = signal<'light' | 'dark'>('light');

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.theme.set(this.safeGetTheme());
    this.applyTheme(this.theme());
  }

  toggleTheme() {
    const next: 'light' | 'dark' = this.theme() === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
  }

  private applyTheme(next: 'light' | 'dark') {
    this.theme.set(next);
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      document.documentElement.classList.toggle('dark', next === 'dark');
      window.localStorage.setItem('theme', next);
    } catch {
      // localStorage/DOM могут быть недоступны (например, в некоторых режимах браузера).
    }
  }

  private safeGetTheme(): 'light' | 'dark' {
    try {
      const v = window.localStorage.getItem('theme');
      return v === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  readonly catalogGroups = computed(() => [
    { title: 'Buttons', items: BUTTONS, footerColors: FOOTER_COLORS_BUTTONS },
    { title: 'Inputs', items: INPUTS, footerColors: FOOTER_COLORS_INPUTS },
    { title: 'Cards', items: CARDS, footerColors: FOOTER_COLORS_CARDS },
    { title: 'ConfirmDialog', items: CONFIRM_DIALOGS, footerColors: FOOTER_COLORS_CONFIRM },
  ]);

  openCatalog() {
    this.isOpen.set(true);
  }
}
