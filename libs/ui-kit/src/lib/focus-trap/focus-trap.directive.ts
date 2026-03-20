// Eve-arch: 000 — без выделенного паттерна
import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[uiFocusTrap]',
  standalone: true,
})
export class FocusTrapDirective implements OnInit, OnDestroy {
  uiFocusTrap = input<boolean>(true);
  closeOnEsc = input<boolean>(true);

  escapePressed = output<void>();

  private previousActiveElement: HTMLElement | null = null;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  ngOnInit(): void {
    this.previousActiveElement = document.activeElement as HTMLElement | null;
  }

  ngOnDestroy(): void {
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.closeOnEsc()) {
      event.preventDefault();
      event.stopPropagation();
      this.escapePressed.emit();
      return;
    }

    if (event.key !== 'Tab' || !this.uiFocusTrap()) return;

    const focusable = this.getFocusableElements();
    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (!active || !this.host.nativeElement.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null);
  }
}
