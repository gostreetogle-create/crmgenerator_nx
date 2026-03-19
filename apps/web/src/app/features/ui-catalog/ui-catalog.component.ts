import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ButtonComponent } from '@ui-kit/button';
import { CardComponent } from '@ui-kit/card';
import { ConfirmDialogComponent } from '@ui-kit/confirm-dialog';
import { InputComponent } from '@ui-kit/input';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface CatalogItem {
  code: string;
  name: string;
  variant?: ButtonVariant;
  subtitle?: string;
}

const BUTTONS: CatalogItem[] = [
  { code: 'b-01', name: 'Primary', variant: 'primary' },
  { code: 'b-02', name: 'Secondary', variant: 'secondary' },
  { code: 'b-03', name: 'Outline', variant: 'outline' },
  { code: 'b-04', name: 'Danger', variant: 'danger' },
  { code: 'b-05', name: 'Ghost', variant: 'ghost' },
];

const INPUTS: CatalogItem[] = [
  { code: 'i-01', name: 'Default input' },
  { code: 'i-02', name: 'Input with error' },
];

const CARDS: CatalogItem[] = [{ code: 'c-01', name: 'Default card' }];

const CONFIRM_DIALOGS: CatalogItem[] = [
  { code: 'd-01', name: 'Danger confirm', subtitle: 'Удаление' },
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

  readonly catalogGroups = computed(() => [
    { title: 'Buttons', items: BUTTONS },
    { title: 'Inputs', items: INPUTS },
    { title: 'Cards', items: CARDS },
    { title: 'ConfirmDialog', items: CONFIRM_DIALOGS },
  ]);

  openCatalog() {
    this.isOpen.set(true);
  }
}
