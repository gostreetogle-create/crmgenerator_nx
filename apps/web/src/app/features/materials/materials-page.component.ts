// Eve-arch: QUERY-008 — поиск/сорт/страница ↔ query params
// Eve-BL: BL-MATERIALS-CRUD-001 — страница материалов
// Eve-BL: BL-BANNER-STATE-001 — уведомления списка/мутаций
// Eve-BL: BL-ENTITY-DELETE-001 — удаление после confirm
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '@ui-kit/button';
import { CardComponent } from '@ui-kit/card';
import { DialogComponent } from '@ui-kit/dialog';
import { InputComponent } from '@ui-kit/input';
import { Material } from '@domain';
import { MaterialFormComponent } from './material-form.component';
import { MaterialsService } from './materials.service';

@Component({
  selector: 'app-materials-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    MaterialFormComponent,
    DialogComponent,
  ],
  templateUrl: './materials-page.component.html',
  styleUrl: './materials-page.component.scss',
})
export class MaterialsPageComponent implements OnInit {
  protected readonly materialsService = inject(MaterialsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private syncingFromUrl = false;

  readonly materials = this.materialsService.materials;
  readonly searchQuery = signal('');
  readonly sortBy = signal<'name' | 'code' | null>(null);
  readonly sortAsc = signal(true);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly showModal = signal(false);
  readonly editingMaterial = signal<Material | null>(null);
  readonly selectedMaterial = signal<Material | null>(null);
  readonly showConfirm = signal(false);
  readonly deletingId = signal<string | null>(null);

  readonly filteredMaterials = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.materials();
    if (q) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.code && m.code.toLowerCase().includes(q)) ||
          (m.notes && m.notes.toLowerCase().includes(q))
      );
    }
    const sort = this.sortBy();
    if (sort) {
      list = [...list].sort((a, b) => {
        const va = sort === 'name' ? a.name.toLowerCase() : (a.code || '').toLowerCase();
        const vb = sort === 'name' ? b.name.toLowerCase() : (b.code || '').toLowerCase();
        if (va < vb) return this.sortAsc() ? -1 : 1;
        if (va > vb) return this.sortAsc() ? 1 : -1;
        return 0;
      });
    }
    return list;
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredMaterials().length / this.pageSize()))
  );

  readonly paginatedMaterials = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize();
    return this.filteredMaterials().slice(start, start + this.pageSize());
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
      this.sortBy.set((params['sort'] as 'name' | 'code' | null) || null);
      this.sortAsc.set(params['asc'] === 'false' ? false : true);
      this.syncingFromUrl = false;
    });
  }

  onOpenModal(m?: Material) {
    this.editingMaterial.set(m ?? null);
    this.showModal.set(true);
  }

  onSelectMaterial(m: Material) {
    this.selectedMaterial.set(m);
  }

  closeEditModal() {
    this.showModal.set(false);
    this.editingMaterial.set(null);
  }

  closeDetailsModal() {
    this.selectedMaterial.set(null);
  }

  onSave(data: Omit<Material, '_id'>) {
    if (!data.name?.trim()) return;
    const editing = this.editingMaterial();
    if (editing?._id) {
      this.materialsService.updateMaterial(editing._id, data);
    } else {
      this.materialsService.addMaterial(data);
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
    this.materialsService.removeMaterial(id);
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

  toggleSort(field: 'name' | 'code') {
    if (this.sortBy() === field) {
      this.sortAsc.set(!this.sortAsc());
    } else {
      this.sortBy.set(field);
      this.sortAsc.set(true);
    }
    this.currentPage.set(1);
  }

  notesPreview(notes?: string): string {
    if (!notes) return '—';
    return notes.length > 48 ? `${notes.slice(0, 48)}…` : notes;
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

}
