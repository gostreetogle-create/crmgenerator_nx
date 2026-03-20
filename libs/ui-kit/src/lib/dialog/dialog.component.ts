import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonComponent } from '../button';
import { FocusTrapDirective } from '../focus-trap';

type DialogMode = 'content' | 'confirm';
type DialogSize = 'sm' | 'md' | 'lg' | 'xl';
type InitialFocus = 'first' | 'confirm' | 'cancel';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent, FocusTrapDirective],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
// Eve-arch: DIALOG-LIFE-009 — lifecycle (open/unmount/события) + shared animations
// Eve-UX: UX-ANIM-001 — режим confirm: опасные действия, тексты и кнопки Подтвердить/Отмена
export class DialogComponent implements OnDestroy {
  mode = input<DialogMode>('content');
  open = input<boolean>(false);
  size = input<DialogSize>('md');
  ariaLabel = input<string>('Диалог');
  closeOnOverlay = input<boolean>(true);
  closeOnEsc = input<boolean>(true);
  trapFocus = input<boolean>(true);
  initialFocus = input<InitialFocus>('first');

  title = input<string>('');
  message = input<string>('');
  confirmText = input<string>('Подтвердить');
  cancelText = input<string>('Отмена');
  confirmVariant = input<'primary' | 'danger'>('primary');
  loading = input<boolean>(false);
  disableConfirm = input<boolean>(false);
  disableCancel = input<boolean>(false);

  closed = output<void>();
  confirmed = output<void>();
  cancelled = output<void>();

  readonly rendered = signal(false);
  readonly closing = signal(false);

  @ViewChild('dialogPanel', { read: ElementRef })
  private dialogPanel?: ElementRef<HTMLElement>;
  @ViewChild('confirmButton', { read: ElementRef })
  private confirmButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('cancelButton', { read: ElementRef })
  private cancelButton?: ElementRef<HTMLButtonElement>;

  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private focusTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly titleIdValue = `dialog-title-${Math.random().toString(36).slice(2, 9)}`;

  readonly labelledBy = computed(() =>
    this.mode() === 'confirm' && this.title().trim() ? this.titleIdValue : null
  );

  constructor() {
    effect(() => {
      this.open();
      this.syncOpenState();
    });
  }

  ngOnDestroy(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    if (this.focusTimer) clearTimeout(this.focusTimer);
  }

  onOverlayClose(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.closeOnOverlay()) return;
    this.handleCancel();
  }

  onEscapeClose(): void {
    if (!this.closeOnEsc()) return;
    this.handleCancel();
  }

  onConfirm(): void {
    if (this.loading() || this.disableConfirm()) return;
    this.confirmed.emit();
  }

  onCancel(): void {
    if (this.disableCancel()) return;
    this.handleCancel();
  }

  private handleCancel(): void {
    if (this.mode() === 'confirm') {
      this.cancelled.emit();
    }
    this.closed.emit();
  }

  private syncOpenState(): void {
    if (this.open()) {
      if (this.hideTimer) clearTimeout(this.hideTimer);
      this.hideTimer = null;
      this.closing.set(false);
      this.rendered.set(true);
      this.queueInitialFocus();
      return;
    }

    if (!this.rendered()) return;
    this.closing.set(true);
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      this.closing.set(false);
      this.rendered.set(false);
      this.hideTimer = null;
    }, 150);
  }

  private queueInitialFocus(): void {
    if (this.focusTimer) clearTimeout(this.focusTimer);
    this.focusTimer = setTimeout(() => {
      this.focusTimer = null;
      this.focusByPolicy();
    }, 0);
  }

  private focusByPolicy(): void {
    const policy = this.initialFocus();
    if (policy === 'confirm' && this.confirmButton?.nativeElement) {
      this.confirmButton.nativeElement.focus();
      return;
    }
    if (policy === 'cancel' && this.cancelButton?.nativeElement) {
      this.cancelButton.nativeElement.focus();
      return;
    }
    this.focusFirstInPanel();
  }

  private focusFirstInPanel(): void {
    const panel = this.dialogPanel?.nativeElement;
    if (!panel) return;

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null);

    focusable[0]?.focus();
  }
}
