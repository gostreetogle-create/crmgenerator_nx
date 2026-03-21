import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { CardComponent } from '@ui-kit/card';

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

interface DialogArticle {
  code: string;
  title: string;
  description: string;
}

const BUTTONS: CatalogItem[] = [
  { code: 'b-01', name: 'Primary loading', spanLabel: 'variant=primary + loading', variant: 'primary' },
  { code: 'b-02', name: 'Slot composition', spanLabel: 'prefix/suffix slots', variant: 'secondary' },
];

const INPUTS: CatalogItem[] = [
  { code: 'i-01', name: 'Prefix/suffix', spanLabel: 'slots + ariaLabel' },
  { code: 'i-02', name: 'Error + hint', spanLabel: 'variant=error + hint' },
  { code: 'i-03', name: 'Disabled loading', spanLabel: 'disabled + loading' },
];

const CARDS: CatalogItem[] = [
  { code: 'c-01', name: 'Hoverable', spanLabel: 'hoverable=true' },
  { code: 'c-02', name: 'Sections', spanLabel: 'header/body/footer slots' },
];

const DIALOGS: CatalogItem[] = [
  { code: 'd-01', name: 'Confirm loading', spanLabel: 'mode=confirm + loading', subtitle: 'confirm' },
  { code: 'd-02', name: 'Content slots', spanLabel: 'header/footer slots', subtitle: 'content' },
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

const FOOTER_COLORS_DIALOG: CatalogFooterColor[] = [
  { code: 'col-18', cssVar: '--overlay-backdrop' },
  { code: 'col-19', cssVar: '--overlay-backdrop-strong' },
  { code: 'col-04', cssVar: '--foreground' },
  { code: 'col-02', cssVar: '--card' },
  { code: 'col-07', cssVar: '--border' },
];

@Component({
  selector: 'app-ui-catalog',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './ui-catalog.component.html',
  styleUrl: './ui-catalog.component.scss',
})
export class UiCatalogComponent {
  readonly showConfirmPreview = signal(false);
  readonly showContentPreview = signal(false);
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

  // Eve-arch: CATALOG-006 — каталог как единый источник правды UI-kit
  readonly catalogGroups = computed(() => [
    { title: 'Buttons', items: BUTTONS, footerColors: FOOTER_COLORS_BUTTONS },
    { title: 'Inputs', items: INPUTS, footerColors: FOOTER_COLORS_INPUTS },
    { title: 'Cards', items: CARDS, footerColors: FOOTER_COLORS_CARDS },
    { title: 'Dialog', items: DIALOGS, footerColors: FOOTER_COLORS_DIALOG },
  ]);

  readonly dialogArticles: DialogArticle[] = [
    {
      code: 'D001',
      title: 'Диалоговое окно подтверждения',
      description: 'sm, кнопки Да/Нет',
    },
    {
      code: 'D002',
      title: 'Среднее окно с формой',
      description: 'md, поля + кнопки',
    },
    {
      code: 'D003',
      title: 'Большое окно с таблицей',
      description: 'lg, просмотр деталей',
    },
    {
      code: 'D004',
      title: 'Всплывашка над полем',
      description: 'sm, список выбора',
    },
    {
      code: 'D005',
      title: 'Окно сбоку (Drawer)',
      description: 'md, фильтры',
    },
    {
      code: 'D006',
      title: 'Уведомление (Alert)',
      description: 'sm, "Успех!"',
    },
  ];

}
