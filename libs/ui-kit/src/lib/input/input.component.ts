import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, computed, input, output } from '@angular/core';

export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'error' | 'success';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  encapsulation: ViewEncapsulation.None,
})
// Eve-arch: INPUT-007 — единый Input API (variant/size/hint/error + outputs)
export class InputComponent {
  value = input<string>('');
  placeholder = input<string>('');
  type = input<InputType>('text');
  size = input<InputSize>('md');
  variant = input<InputVariant>('default');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  hint = input<string>('');
  error = input<string>('');
  showErrorText = input<boolean>(true);
  ariaLabel = input<string | null>(null);

  // Backward-compatible optional label/id for existing forms.
  label = input<string>('');
  id = input<string>('');

  changed = output<string>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  focus = output<void>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  blur = output<void>();
  valueChange = output<string>();

  private readonly fallbackId = `app-input-${Math.random().toString(36).slice(2, 9)}`;

  protected readonly inputId = computed(() => this.id() || this.fallbackId);
  protected readonly hintId = computed(() => `${this.inputId()}-hint`);
  protected readonly resolvedHint = computed(() => {
    if (this.error().trim() && this.showErrorText()) return this.error().trim();
    return this.hint().trim();
  });
  protected readonly hasHint = computed(() => Boolean(this.resolvedHint()));
  protected readonly isError = computed(() => this.variant() === 'error' || Boolean(this.error().trim()));

  protected readonly inputClasses = computed(() =>
    [
      'ui-input',
      `ui-input--${this.size()}`,
      `ui-input--${this.variant()}`,
      this.loading() ? 'ui-input--loading' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  protected onInput(event: Event) {
    const nextValue = (event.target as HTMLInputElement).value;
    this.changed.emit(nextValue);
    this.valueChange.emit(nextValue);
  }

  protected onFocus() {
    this.focus.emit();
  }

  protected onBlur() {
    this.blur.emit();
  }
}
