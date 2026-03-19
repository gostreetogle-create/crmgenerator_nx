import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { ButtonComponent } from '../button';
import { CardComponent } from '../card';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialogComponent {
  title = input<string>('Подтверждение');
  message = input<string>('Вы уверены?');
  confirmText = input<string>('Да, удалить');
  cancelText = input<string>('Отмена');
  confirmVariant = input<'primary' | 'danger'>('danger');
  open = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.open()) {
      this.cancelled.emit();
    }
  }
}
