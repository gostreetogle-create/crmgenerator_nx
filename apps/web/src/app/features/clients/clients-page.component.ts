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
import { Client } from '@domain';
import { ClientFormComponent } from './client-form.component';
import { ClientsService } from './clients.service';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    ClientFormComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.scss',
})
export class ClientsPageComponent implements OnInit {
  protected readonly clientsService = inject(ClientsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private syncingFromUrl = false;

  readonly clients = this.clientsService.clients;
  readonly searchQuery = signal<string>('');
  readonly sortBy = signal<'name' | 'discount' | null>(null);
  readonly sortAsc = signal<boolean>(true);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly showModal = signal(false);
  readonly editingClient = signal<Client | null>(null);
  readonly selectedClient = signal<Client | null>(null);
  readonly showConfirm = signal(false);
  readonly deletingId = signal<string | null>(null);

  @ViewChild('editModalPanel', { read: ElementRef }) private editModalPanel?: ElementRef<HTMLElement>;
  @ViewChild('detailsModalCard', { read: ElementRef }) private detailsModalCard?: ElementRef<HTMLElement>;

  readonly filteredClients = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.clients();
    if (q) {
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.inn && c.inn.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q))
      );
    }

    const sort = this.sortBy();
    if (sort) {
      list = [...list].sort((a, b) => {
        const va = sort === 'name' ? a.name.toLowerCase() : (a.discount || 0);
        const vb = sort === 'name' ? b.name.toLowerCase() : (b.discount || 0);
        if (va < vb) return this.sortAsc() ? -1 : 1;
        if (va > vb) return this.sortAsc() ? 1 : -1;
        return 0;
      });
    }

    return list;
  });
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredClients().length / this.pageSize()))
  );
  readonly paginatedClients = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize();
    return this.filteredClients().slice(start, start + this.pageSize());
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
      if (!this.syncingFromUrl) {
        this.updateUrl();
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.syncingFromUrl = true;
      this.searchQuery.set(params['search'] || '');
      this.currentPage.set(Math.max(1, +params['page'] || 1));
      this.sortBy.set((params['sort'] as 'name' | 'discount' | null) || null);
      this.sortAsc.set(params['asc'] === 'false' ? false : true);
      this.syncingFromUrl = false;
    });
  }

  onOpenModal(client?: Client) {
    if (client) {
      this.editingClient.set(client);
    } else {
      this.editingClient.set(null);
    }
    this.showModal.set(true);
    // Даем Angular отрендерить modal, затем ставим фокус на первый интерактивный элемент.
    setTimeout(() => this.focusFirstFocusable(this.editModalPanel?.nativeElement), 0);
  }

  onSelectClient(client: Client) {
    this.selectedClient.set(client);
    setTimeout(() => this.focusFirstFocusable(this.detailsModalCard?.nativeElement), 0);
  }

  closeEditModal() {
    this.showModal.set(false);
    this.editingClient.set(null);
  }

  closeDetailsModal() {
    this.selectedClient.set(null);
  }

  onSave(data: Partial<Client>) {
    const editing = this.editingClient();
    if (!data.name?.trim()) return;

    if (editing?._id) {
      this.clientsService.updateClient(editing._id, data);
    } else {
      this.clientsService.addClient({
        name: data.name.trim(),
        inn: data.inn,
        kpp: data.kpp,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        requisites: data.requisites,
        address: data.address,
        notes: data.notes,
        discount: data.discount,
        clientMarkup: data.clientMarkup,
      });
    }

    this.showModal.set(false);
    this.editingClient.set(null);
  }

  onDelete(id: string) {
    this.deletingId.set(id);
    this.showConfirm.set(true);
  }

  onConfirmDelete() {
    const id = this.deletingId();
    if (!id) return;
    this.clientsService.removeClient(id);
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

  toggleSort(field: 'name' | 'discount') {
    if (this.sortBy() === field) {
      this.sortAsc.set(!this.sortAsc());
    } else {
      this.sortBy.set(field);
      this.sortAsc.set(true);
    }
    this.currentPage.set(1);
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
      if (this.showModal()) {
        this.closeEditModal();
        return;
      }
      if (this.selectedClient()) {
        this.closeDetailsModal();
        return;
      }
    }

    if (event.key !== 'Tab') return;

    const container = this.getFocusTrapContainer();
    if (!container) return;

    const focusables = this.getFocusableElements(container);
    if (!focusables.length) return;

    const active = document.activeElement as HTMLElement | null;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const activeInside = active ? container.contains(active) : false;
    if (!activeInside) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey) {
      if (active === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  private getFocusTrapContainer(): HTMLElement | null {
    if (this.showModal()) return this.editModalPanel?.nativeElement ?? null;
    if (this.selectedClient()) return this.detailsModalCard?.nativeElement ?? null;
    return null;
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const nodes = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    // Фильтруем скрытые элементы.
    return nodes.filter((el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null);
  }

  private focusFirstFocusable(container?: HTMLElement) {
    if (!container) return;
    const focusables = this.getFocusableElements(container);
    focusables[0]?.focus?.();
  }
}
