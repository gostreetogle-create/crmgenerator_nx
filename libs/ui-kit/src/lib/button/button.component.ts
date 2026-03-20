// Eve-arch: 000 — без выделенного паттерна
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonMode = 'default' | 'icon';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  mode = input<ButtonMode>('default');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  ariaLabel = input<string | null>(null);

  clicked = output<void>();

  protected readonly buttonClasses = computed(() =>
    [
      'btn',
      `btn--${this.variant()}`,
      `btn--${this.size()}`,
      `btn--${this.mode()}`,
      this.fullWidth() ? 'btn--full' : '',
      this.loading() ? 'btn--loading' : '',
      this.disabled() ? 'btn--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  protected onClick() {
    if (this.disabled() || this.loading()) return;
    this.clicked.emit();
  }
}
