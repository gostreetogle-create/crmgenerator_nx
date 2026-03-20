// Eve-arch: 000 — без выделенного паттерна
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, computed, input } from '@angular/core';

export type CardVariant = 'default' | 'outlined' | 'elevated';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CardComponent {
  title = input<string>('');
  subtitle = input<string>('');
  footer = input<boolean>(false);
  hoverable = input<boolean>(true);
  sections = input<boolean>(true);
  variant = input<CardVariant>('default');
  ariaLabel = input<string | null>(null);

  protected readonly cardClasses = computed(() =>
    ['card', `card--${this.variant()}`, this.hoverable() ? 'card--hover' : '']
      .filter(Boolean)
      .join(' ')
  );
}
