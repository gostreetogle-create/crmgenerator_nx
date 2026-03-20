import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '@ui-kit/button';
import { CardComponent } from '@ui-kit/card';
import { ConfirmDialogComponent } from '@ui-kit/confirm-dialog';
import { InputComponent } from '@ui-kit/input';
import { PartType } from '@domain';
import { PartTypeFormComponent } from './part-type-form.component';
import { PartTypesService } from './part-types.service';

@Component({
  selector: 'app-part-types-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    PartTypeFormComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './part-types-page.component.html',
  styleUrl: './part-types-page.component.scss',
})
export class PartTypesPageComponent implements OnInit {
  protected readonly partTypesService = inject(PartTypesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private syncingFromUrl = false;

  readonly partTypes = this.partTypesService.partTypes;
  readonly searchQuery = signal('');
  readonly sortBy = signal<'name' | null>(null);
  readonly sortAsc = signal(true);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly showModal = signal(false);
  readonly editingPartType = signal<PartType | null>(null);
  readonly selectedPartType = signal<PartType | null>(null);
  readonly showConfirm = signal(false);
  readonly deletingId = signal<string | null>(null);

  @ViewChild('editModalPanel', { read: ElementRef })
  private editModalPanel?: ElementRef<HTMLElement>;
  @ViewChild('detailsModalCard', { read: ElementRef })
  private detailsModalCard?: ElementRef<HTMLElement>;

  readonly filteredPartTypes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.partTypes();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (this.sortBy() === 'name') {
      list = [...list].sort((a, b) => {
        const va = a.name.toLowerCase();
        const vb = b.name.toLowerCase();
        if (va < vb) return this.sortAsc() ? -1 : 1;
        if (va > vb) return this.sortAsc() ? 1 : -1;
        return 0;
      });
    }
    return list;
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredPartTypes().length / this.pageSize()))
  );

  readonly paginatedPartTypes = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize();
    return this.filteredPartTypes().slice(start, start + this.pageSize());
  });

  constructor() {
    effect(() => {
      const total = this.totalPages();
      const page = this.currentPage();
      if (page > total) this.currentPage.set(total);
      if (page < 1) this.currentPage.set(1);
    });
    effect(() => {
      this.searchQuery();
      this.currentPage();
      this.sortBy();
      this.sortAsc();
      if (!this.syncingFromUrl) this.updateUrl();
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.syncingFromUrl = true;
      this.searchQuery.set(params['search'] || '');
      this.currentPage.set(Math.max(1, +params['page'] || 1));
      this.sortBy.set((params['sort'] as 'name' | null) || null);
      this.sortAsc.set(params['asc'] === 'false' ? false : true);
      this.syncingFromUrl = false;
    });
  }

  onOpenModal(p?: PartType) {
    this.editingPartType.set(p ?? null);
    this.showModal.set(true);
    setTimeout(() => this.focusFirst(this.editModalPanel?.nativeElement), 0);
  }

  onSelectPartType(p: PartType) {
    this.selectedPartType.set(p);
    setTimeout(() => this.focusFirst(this.detailsModalCard?.nativeElement), 0);
  }

  closeEditModal() {
    this.showModal.set(false);
    this.editingPartType.set(null);
  }

  closeDetailsModal() {
    this.selectedPartType.set(null);
  }

  onSave(data: Omit<PartType, '_id'>) {
    if (!data.name?.trim()) return;
    const editing = this.editingPartType();
    if (editing?._id) {
      this.partTypesService.updatePartType(editing._id, data);
    } else {
      this.partTypesService.addPartType(data);
    }
    this.closeEditModal();
  }

  onDelete(id: string) {
    this.deletingId.set(id);
    this.showConfirm.set(true);
  }

  onConfirmDelete() {
    const id = this.deletingId();
    if (!id) return;
    this.partTypesService.removePartType(id);
    this.showConfirm.set(false);
    this.deletingId.set(null);
  }

  setSearchQuery(value: string) {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  goPrevPage() {
    this.currentPage.update((p) => Math.max(1, p - 1));
  }

  goNextPage() {
    this.currentPage.update((p) => Math.min(this.totalPages(), p + 1));
  }

  toggleSortName() {
    if (this.sortBy() === 'name') {
      this.sortAsc.set(!this.sortAsc());
    } else {
      this.sortBy.set('name');
      this.sortAsc.set(true);
    }
    this.currentPage.set(1);
  }

  descPreview(d?: string): string {
    if (!d) return '—';
    return d.length > 56 ? `${d.slice(0, 56)}…` : d;
  }

  private updateUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery() || null,
        page: this.currentPage(),
        sort: this.sortBy(),
        asc: this.sortAsc(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showModal()) this.closeEditModal();
      else if (this.selectedPartType()) this.closeDetailsModal();
    }
    if (event.key !== 'Tab') return;
    const container = this.showModal()
      ? this.editModalPanel?.nativeElement
      : this.selectedPartType()
        ? this.detailsModalCard?.nativeElement
        : null;
    if (!container) return;
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null);
    if (!focusables.length) return;
    const active = document.activeElement as HTMLElement | null;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!(active && container.contains(active))) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey) {
      if (active === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusFirst(container?: HTMLElement) {
    if (!container) return;
    const nodes = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null);
    nodes[0]?.focus?.();
  }
}
