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
import { Organization } from '@domain';
import { OrganizationFormComponent } from './organization-form.component';
import { OrganizationsService } from './organizations.service';

@Component({
  selector: 'app-organizations-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    OrganizationFormComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './organizations-page.component.html',
  styleUrl: './organizations-page.component.scss',
})
export class OrganizationsPageComponent implements OnInit {
  protected readonly organizationsService = inject(OrganizationsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private syncingFromUrl = false;

  readonly organizations = this.organizationsService.organizations;
  readonly searchQuery = signal<string>('');
  readonly sortBy = signal<'name' | 'inn' | null>(null);
  readonly sortAsc = signal<boolean>(true);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly showModal = signal(false);
  readonly editingOrganization = signal<Organization | null>(null);
  readonly selectedOrganization = signal<Organization | null>(null);
  readonly showConfirm = signal(false);
  readonly deletingId = signal<string | null>(null);

  @ViewChild('editModalPanel', { read: ElementRef }) private editModalPanel?: ElementRef<HTMLElement>;
  @ViewChild('detailsModalCard', { read: ElementRef }) private detailsModalCard?: ElementRef<HTMLElement>;

  readonly filteredOrganizations = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.organizations();
    if (q) {
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          (o.shortName && o.shortName.toLowerCase().includes(q)) ||
          (o.fullName && o.fullName.toLowerCase().includes(q)) ||
          (o.inn && o.inn.includes(q)) ||
          (o.phone && o.phone.toLowerCase().includes(q)) ||
          (o.email && o.email.toLowerCase().includes(q)) ||
          (o.directorFio && o.directorFio.toLowerCase().includes(q))
      );
    }

    const sort = this.sortBy();
    if (sort) {
      list = [...list].sort((a, b) => {
        const va = sort === 'name' ? a.name.toLowerCase() : (a.inn || '');
        const vb = sort === 'name' ? b.name.toLowerCase() : (b.inn || '');
        if (va < vb) return this.sortAsc() ? -1 : 1;
        if (va > vb) return this.sortAsc() ? 1 : -1;
        return 0;
      });
    }

    return list;
  });
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredOrganizations().length / this.pageSize()))
  );
  readonly paginatedOrganizations = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize();
    return this.filteredOrganizations().slice(start, start + this.pageSize());
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
      this.sortBy.set((params['sort'] as 'name' | 'inn' | null) || null);
      this.sortAsc.set(params['asc'] === 'false' ? false : true);
      this.syncingFromUrl = false;
    });
  }

  onOpenModal(org?: Organization) {
    if (org) {
      this.editingOrganization.set(org);
    } else {
      this.editingOrganization.set(null);
    }
    this.showModal.set(true);
    setTimeout(() => this.focusFirstFocusable(this.editModalPanel?.nativeElement), 0);
  }

  onSelectOrganization(org: Organization) {
    this.selectedOrganization.set(org);
    setTimeout(() => this.focusFirstFocusable(this.detailsModalCard?.nativeElement), 0);
  }

  closeEditModal() {
    this.showModal.set(false);
    this.editingOrganization.set(null);
  }

  closeDetailsModal() {
    this.selectedOrganization.set(null);
  }

  onSave(data: Partial<Organization>) {
    if (!data.name?.trim()) return;

    const editing = this.editingOrganization();
    if (editing?._id) {
      this.organizationsService.updateOrganization(editing._id, data);
    } else {
      this.organizationsService.addOrganization({
        name: data.name.trim(),
        fullName: data.fullName,
        shortName: data.shortName,
        inn: data.inn,
        kpp: data.kpp,
        ogrn: data.ogrn,
        okpo: data.okpo,
        okved: data.okved,
        legalAddress: data.legalAddress,
        actualAddress: data.actualAddress,
        postalAddress: data.postalAddress,
        bankName: data.bankName,
        bik: data.bik,
        settlementAccount: data.settlementAccount,
        correspondentAccount: data.correspondentAccount,
        phone: data.phone,
        extraPhone: data.extraPhone,
        email: data.email,
        website: data.website,
        directorFio: data.directorFio,
        directorFioShort: data.directorFioShort,
        directorPosition: data.directorPosition,
        directorActingOn: data.directorActingOn,
        fssNumber: data.fssNumber,
        pfrNumber: data.pfrNumber,
        notes: data.notes,
        markup: data.markup,
        prefix: data.prefix,
        vatPercent: data.vatPercent,
        requisites: data.requisites,
        logoUrl: data.logoUrl,
        signatureUrl: data.signatureUrl,
        stampUrl: data.stampUrl,
      });
    }

    this.showModal.set(false);
    this.editingOrganization.set(null);
  }

  onDelete(id: string) {
    this.deletingId.set(id);
    this.showConfirm.set(true);
  }

  onConfirmDelete() {
    const id = this.deletingId();
    if (!id) return;
    this.organizationsService.removeOrganization(id);
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

  toggleSort(field: 'name' | 'inn') {
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
      if (this.selectedOrganization()) {
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
    if (this.selectedOrganization()) return this.detailsModalCard?.nativeElement ?? null;
    return null;
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const nodes = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    return nodes.filter((el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null);
  }

  private focusFirstFocusable(container?: HTMLElement) {
    if (!container) return;
    const focusables = this.getFocusableElements(container);
    focusables[0]?.focus?.();
  }
}
