// Eve-arch: 000 — без выделенного паттерна
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
import { Category } from '@domain';
import { CategoryFormComponent } from './category-form.component';
import { CategoriesService } from './categories.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    CategoryFormComponent,
    DialogComponent,
  ],
  templateUrl: './categories-page.component.html',
  styleUrl: './categories-page.component.scss',
})
export class CategoriesPageComponent implements OnInit {
  protected readonly categoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private syncingFromUrl = false;

  readonly categories = this.categoriesService.categories;
  readonly searchQuery = signal('');
  readonly sortBy = signal<'name' | 'sortOrder' | null>(null);
  readonly sortAsc = signal(true);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly showModal = signal(false);
  readonly editingCategory = signal<Category | null>(null);
  readonly selectedCategory = signal<Category | null>(null);
  readonly showConfirm = signal(false);
  readonly deletingId = signal<string | null>(null);

  readonly filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.categories();
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    const sort = this.sortBy();
    if (sort) {
      list = [...list].sort((a, b) => {
        const va = sort === 'name' ? a.name.toLowerCase() : (a.sortOrder ?? 0);
        const vb = sort === 'name' ? b.name.toLowerCase() : (b.sortOrder ?? 0);
        if (va < vb) return this.sortAsc() ? -1 : 1;
        if (va > vb) return this.sortAsc() ? 1 : -1;
        return 0;
      });
    }
    return list;
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredCategories().length / this.pageSize()))
  );

  readonly paginatedCategories = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize();
    return this.filteredCategories().slice(start, start + this.pageSize());
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
      this.sortBy.set((params['sort'] as 'name' | 'sortOrder' | null) || null);
      this.sortAsc.set(params['asc'] === 'false' ? false : true);
      this.syncingFromUrl = false;
    });
  }

  parentName(parentId?: string): string {
    if (!parentId) return '—';
    const c = this.categories().find((x) => x._id === parentId);
    return c?.name ?? parentId;
  }

  onOpenModal(cat?: Category) {
    this.editingCategory.set(cat ?? null);
    this.showModal.set(true);
  }

  onSelectCategory(cat: Category) {
    this.selectedCategory.set(cat);
  }

  closeEditModal() {
    this.showModal.set(false);
    this.editingCategory.set(null);
  }

  closeDetailsModal() {
    this.selectedCategory.set(null);
  }

  onSave(data: Omit<Category, '_id'>) {
    if (!data.name?.trim()) return;
    const editing = this.editingCategory();
    if (editing?._id) {
      this.categoriesService.updateCategory(editing._id, data);
    } else {
      this.categoriesService.addCategory(data);
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
    this.categoriesService.removeCategory(id);
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

  toggleSort(field: 'name' | 'sortOrder') {
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

}
