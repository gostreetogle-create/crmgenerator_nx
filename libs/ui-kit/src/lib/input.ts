import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-input',
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './input.html',
  styleUrl: './input.scss',
  host: {
    class: 'input-wrapper',
  },
})
export class InputComponent {
  id = input<string>('');
  label = input<string>('');
  placeholder = input<string>('');
  value = input<string>('');
  disabled = input<boolean>(false);
  error = input<string>('');
  size = input<'sm' | 'md' | 'lg'>('sm');
  type = input<'text' | 'email' | 'password' | 'tel' | 'number'>('text');
  valueChange = output<string>();
  private readonly fallbackId = `app-input-${Math.random().toString(36).slice(2, 9)}`;

  protected inputId = computed(() => this.id() || this.fallbackId);

  protected computedClasses = computed(() => {
    const classes = ['ui-input', `ui-input--${this.size()}`];
    if (this.error()) classes.push('input--error');
    return classes.join(' ');
  });

  protected onInput(event: Event) {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
