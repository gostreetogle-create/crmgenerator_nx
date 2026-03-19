import { CommonModule } from '@angular/common';
import {
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonComponent {
  /** Вариант стиля кнопки */
  variant = input<ButtonVariant>('primary');

  /** Размер кнопки */
  size = input<ButtonSize>('md');

  /** Полная ширина (full-width) */
  fullWidth = input<boolean>(false);

  /** Отключена ли кнопка */
  disabled = input<boolean>(false);

  /** Состояние загрузки (показывает спиннер вместо текста) */
  loading = input<boolean>(false);

  /** Тип кнопки (submit / button / reset) */
  type = input<'button' | 'submit' | 'reset'>('button');

  /** Событие клика (лучше использовать вместо (click) напрямую) */
  clicked = output<void>();

  // Computed классы для host (чтобы не дублировать в шаблоне)
  protected hostClasses = computed(() => {
    const classes = [
      'btn',
      `btn--${this.variant()}`,
      `btn--${this.size()}`,
      this.fullWidth() ? 'btn--full' : '',
      this.loading() ? 'btn--loading' : '',
      this.disabled() ? 'btn--disabled' : '',
    ];
    return classes.filter(Boolean).join(' ');
  });

  onClick() {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
