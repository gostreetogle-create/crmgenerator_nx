import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  ViewEncapsulation,
  effect,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-quick-add-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-add-dialog.html',
  styleUrl: './quick-add-dialog.scss',
  encapsulation: ViewEncapsulation.None,
})
export class QuickAddDialogComponent implements OnDestroy {
  open = input<boolean>(false);
  title = input<string>('Диалог');
  closeAriaLabel = input<string>('Закрыть');
  size = input<'sm' | 'md' | 'lg'>('sm');

  closed = output<void>();

  readonly rendered = signal(false);
  readonly closing = signal(false);

  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.open();
      this.syncOpenState();
    });
  }

  ngOnDestroy(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }

  syncOpenState(): void {
    if (this.open()) {
      if (this.hideTimer) clearTimeout(this.hideTimer);
      this.hideTimer = null;
      this.closing.set(false);
      this.rendered.set(true);
      return;
    }
    if (!this.rendered()) return;
    this.closing.set(true);
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      this.closing.set(false);
      this.rendered.set(false);
      this.hideTimer = null;
    }, 140);
  }

  onBackdropClose(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.closed.emit();
  }
}
