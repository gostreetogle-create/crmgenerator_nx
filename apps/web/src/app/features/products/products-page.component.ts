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
import { QuickAddDialogComponent } from '@ui-kit/quick-add-dialog';
import { Category, Material, PartType, Product } from '@domain';
import { finalize } from 'rxjs';
import { CatalogLookupService } from '../../core/catalog';
import { CategoryFormComponent } from '../categories/category-form.component';
import { CategoriesService } from '../categories/categories.service';
import { MaterialFormComponent } from '../materials/material-form.component';
import { MaterialsService } from '../materials/materials.service';
import { PartTypeFormComponent } from '../part-types/part-type-form.component';
import { PartTypesService } from '../part-types/part-types.service';
import { ProductFormComponent } from './product-form.component';
import { ProductsService } from './products.service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    QuickAddDialogComponent,
    ProductFormComponent,
    ConfirmDialogComponent,
    CategoryFormComponent,
    PartTypeFormComponent,
    MaterialFormComponent,
  ],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.scss',
})
export class ProductsPageComponent implements OnInit {
  protected readonly productsService = inject(ProductsService);
  protected readonly catalogLookup = inject(CatalogLookupService);
  protected readonly categoriesService = inject(CategoriesService);
  protected readonly partTypesService = inject(PartTypesService);
  protected readonly materialsService = inject(MaterialsService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private syncingFromUrl = false;

  readonly products = this.productsService.products;
  readonly searchQuery = signal('');
  readonly sortBy = signal<'name' | 'sku' | null>(null);
  readonly sortAsc = signal(true);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly showModal = signal(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly selectedProduct = signal<Product | null>(null);
  readonly showConfirm = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly showProductCategoryModal = signal(false);
  readonly showProductPartTypeModal = signal(false);
  readonly showProductMaterialModal = signal(false);
  readonly productPickerBusy = signal(false);
  readonly productFormInteractionLocked = signal(false);
  private allowProductModalClose = false;
  private readonly lastQuickAddActionAt = signal(0);

  /** Клик по строке товара: фильтр боковых колонок; повторный клик — сброс. */
  readonly contextProductId = signal<string | null>(null);

  readonly showCategoryColModal = signal(false);
  readonly showPartTypeColModal = signal(false);
  readonly showMaterialColModal = signal(false);
  readonly colPickerBusy = signal(false);

  @ViewChild('editModalPanel', { read: ElementRef })
  private editModalPanel?: ElementRef<HTMLElement>;
  @ViewChild('detailsModalCard', { read: ElementRef })
  private detailsModalCard?: ElementRef<HTMLElement>;

  readonly contextProduct = computed(() => {
    const id = this.contextProductId();
    if (!id) return null;
    return this.products().find((p) => p._id === id) ?? null;
  });

  readonly displayCategories = computed(() => {
    const all = this.categoriesService.categories();
    if (!this.contextProductId()) return all;
    const ctx = this.contextProduct();
    if (!ctx?.categoryId?.trim()) return [];
    return all.filter((c) => c._id === ctx.categoryId);
  });

  readonly displayPartTypes = computed(() => {
    const all = this.partTypesService.partTypes();
    if (!this.contextProductId()) return all;
    const ctx = this.contextProduct();
    if (!ctx?.partTypeId?.trim()) return [];
    return all.filter((p) => p._id === ctx.partTypeId);
  });

  readonly displayMaterials = computed(() => {
    const all = this.materialsService.materials();
    if (!this.contextProductId()) return all;
    const ctx = this.contextProduct();
    if (!ctx?.materialId?.trim()) return [];
    return all.filter((m) => m._id === ctx.materialId);
  });

  readonly filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.products();
    if (q) {
      list = list.filter((p) => {
        const cat = this.catalogLookup.categoryName(p.categoryId).toLowerCase();
        const pt = this.catalogLookup.partTypeName(p.partTypeId).toLowerCase();
        const mat = this.catalogLookup.materialName(p.materialId).toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q)) ||
          cat.includes(q) ||
          pt.includes(q) ||
          mat.includes(q)
        );
      });
    }
    const sort = this.sortBy();
    if (sort) {
      list = [...list].sort((a, b) => {
        const va =
          sort === 'name'
            ? a.name.toLowerCase()
            : (a.sku || '').toLowerCase();
        const vb =
          sort === 'name'
            ? b.name.toLowerCase()
            : (b.sku || '').toLowerCase();
        if (va < vb) return this.sortAsc() ? -1 : 1;
        if (va > vb) return this.sortAsc() ? 1 : -1;
        return 0;
      });
    }
    return list;
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize()))
  );

  readonly paginatedProducts = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize();
    return this.filteredProducts().slice(start, start + this.pageSize());
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
    this.catalogLookup.ensureLoaded();
    this.route.queryParams.subscribe((params) => {
      this.syncingFromUrl = true;
      this.searchQuery.set(params['search'] || '');
      this.currentPage.set(Math.max(1, +params['page'] || 1));
      this.sortBy.set((params['sort'] as 'name' | 'sku' | null) || null);
      this.sortAsc.set(params['asc'] === 'false' ? false : true);
      this.syncingFromUrl = false;
    });
  }

  clearContext() {
    this.contextProductId.set(null);
  }

  /** Сброс контекста при клике вне строки выбранного товара (без скачка layout от отдельной панели). */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const cid = this.contextProductId();
    if (!cid) return;
    const t = event.target as HTMLElement | null;
    if (!t) return;
    if (t.closest('.modal-backdrop')) return;
    const row = t.closest('tr[data-product-id]');
    const rid = row?.getAttribute('data-product-id') ?? null;
    if (rid === cid) return;
    this.contextProductId.set(null);
  }

  onProductRowClick(p: Product, event: MouseEvent) {
    const el = event.target as HTMLElement;
    if (el.closest('[data-product-row-actions]')) return;
    const id = p._id;
    if (!id) return;
    if (this.contextProductId() === id) {
      this.contextProductId.set(null);
    } else {
      this.contextProductId.set(id);
    }
  }

  isContextRow(p: Product): boolean {
    return Boolean(p._id && p._id === this.contextProductId());
  }

  onOpenModal(p?: Product) {
    this.editingProduct.set(p ?? null);
    this.productFormInteractionLocked.set(false);
    this.showModal.set(true);
    setTimeout(() => this.focusFirst(this.editModalPanel?.nativeElement), 0);
  }

  onSelectProduct(p: Product) {
    this.selectedProduct.set(p);
    setTimeout(() => this.focusFirst(this.detailsModalCard?.nativeElement), 0);
  }

  private closeEditModal() {
    if (!this.allowProductModalClose) return;
    if (this.productFormInteractionLocked()) return;
    this.showModal.set(false);
    this.editingProduct.set(null);
    this.productFormInteractionLocked.set(false);
    this.showProductCategoryModal.set(false);
    this.showProductPartTypeModal.set(false);
    this.showProductMaterialModal.set(false);
    this.allowProductModalClose = false;
  }

  closeDetailsModal() {
    this.selectedProduct.set(null);
  }

  onSave(data: Omit<Product, '_id'>) {
    if (this.isInQuickAddCooldown()) return;
    if (this.productFormInteractionLocked()) return;
    if (!data.name?.trim() || !data.categoryId?.trim()) return;
    const editing = this.editingProduct();
    if (editing?._id) {
      this.productsService.updateProduct(editing._id, data);
    } else {
      this.productsService.addProduct(data);
    }
    this.allowProductModalClose = true;
    this.closeEditModal();
  }

  onProductCloseRequested() {
    if (this.isInQuickAddCooldown()) return;
    if (this.productFormInteractionLocked()) return;
    this.allowProductModalClose = true;
    this.closeEditModal();
  }

  openProductCategoryPicker() {
    this.bumpQuickAddAction();
    this.productFormInteractionLocked.set(true);
    this.showProductCategoryModal.set(true);
  }

  openProductPartTypePicker() {
    this.bumpQuickAddAction();
    this.productFormInteractionLocked.set(true);
    this.showProductPartTypeModal.set(true);
  }

  openProductMaterialPicker() {
    this.bumpQuickAddAction();
    this.productFormInteractionLocked.set(true);
    this.showProductMaterialModal.set(true);
  }

  closeProductCategoryPicker() {
    if (this.productPickerBusy()) return;
    this.bumpQuickAddAction();
    this.showProductCategoryModal.set(false);
    this.unlockProductFormInteractionSoon();
  }

  closeProductPartTypePicker() {
    if (this.productPickerBusy()) return;
    this.bumpQuickAddAction();
    this.showProductPartTypeModal.set(false);
    this.unlockProductFormInteractionSoon();
  }

  closeProductMaterialPicker() {
    if (this.productPickerBusy()) return;
    this.bumpQuickAddAction();
    this.showProductMaterialModal.set(false);
    this.unlockProductFormInteractionSoon();
  }

  onProductCategorySave(data: Omit<Category, '_id'>) {
    this.productPickerBusy.set(true);
    this.categoriesService
      .addCategoryForPicker(data)
      .pipe(finalize(() => this.productPickerBusy.set(false)))
      .subscribe({
        next: () => {
          this.bumpQuickAddAction();
          this.catalogLookup.applyFromSignals({
            categories: [...this.categoriesService.categories()],
          });
          this.showProductCategoryModal.set(false);
          this.unlockProductFormInteractionSoon();
        },
        error: () => {
          /* mutationError в CategoriesService */
        },
      });
  }

  onProductPartTypeSave(data: Omit<PartType, '_id'>) {
    this.productPickerBusy.set(true);
    this.partTypesService
      .addPartTypeForPicker(data)
      .pipe(finalize(() => this.productPickerBusy.set(false)))
      .subscribe({
        next: () => {
          this.bumpQuickAddAction();
          this.catalogLookup.applyFromSignals({
            partTypes: [...this.partTypesService.partTypes()],
          });
          this.showProductPartTypeModal.set(false);
          this.unlockProductFormInteractionSoon();
        },
        error: () => {
          /* mutationError в PartTypesService */
        },
      });
  }

  onProductMaterialSave(data: Omit<Material, '_id'>) {
    this.productPickerBusy.set(true);
    this.materialsService
      .addMaterialForPicker(data)
      .pipe(finalize(() => this.productPickerBusy.set(false)))
      .subscribe({
        next: () => {
          this.bumpQuickAddAction();
          this.catalogLookup.applyFromSignals({
            materials: [...this.materialsService.materials()],
          });
          this.showProductMaterialModal.set(false);
          this.unlockProductFormInteractionSoon();
        },
        error: () => {
          /* mutationError в MaterialsService */
        },
      });
  }

  onDelete(id: string, event?: Event) {
    event?.stopPropagation();
    this.deletingId.set(id);
    this.showConfirm.set(true);
  }

  onConfirmDelete() {
    const id = this.deletingId();
    if (!id) return;
    this.productsService.removeProduct(id);
    if (this.contextProductId() === id) {
      this.contextProductId.set(null);
    }
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

  toggleSort(field: 'name' | 'sku') {
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

  closeColCategoryPicker() {
    if (this.colPickerBusy()) return;
    this.showCategoryColModal.set(false);
  }

  closeColPartTypePicker() {
    if (this.colPickerBusy()) return;
    this.showPartTypeColModal.set(false);
  }

  closeColMaterialPicker() {
    if (this.colPickerBusy()) return;
    this.showMaterialColModal.set(false);
  }

  onColCategorySave(data: Omit<Category, '_id'>) {
    this.colPickerBusy.set(true);
    this.categoriesService
      .addCategoryForPicker(data)
      .pipe(finalize(() => this.colPickerBusy.set(false)))
      .subscribe({
        next: () => {
          this.catalogLookup.applyFromSignals({
            categories: [...this.categoriesService.categories()],
          });
          this.showCategoryColModal.set(false);
        },
        error: () => {
          /* mutationError в CategoriesService */
        },
      });
  }

  onColPartTypeSave(data: Omit<PartType, '_id'>) {
    this.colPickerBusy.set(true);
    this.partTypesService
      .addPartTypeForPicker(data)
      .pipe(finalize(() => this.colPickerBusy.set(false)))
      .subscribe({
        next: () => {
          this.catalogLookup.applyFromSignals({
            partTypes: [...this.partTypesService.partTypes()],
          });
          this.showPartTypeColModal.set(false);
        },
        error: () => {
          /* mutationError в PartTypesService */
        },
      });
  }

  onColMaterialSave(data: Omit<Material, '_id'>) {
    this.colPickerBusy.set(true);
    this.materialsService
      .addMaterialForPicker(data)
      .pipe(finalize(() => this.colPickerBusy.set(false)))
      .subscribe({
        next: () => {
          this.catalogLookup.applyFromSignals({
            materials: [...this.materialsService.materials()],
          });
          this.showMaterialColModal.set(false);
        },
        error: () => {
          /* mutationError в MaterialsService */
        },
      });
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
      if (this.showCategoryColModal()) {
        this.closeColCategoryPicker();
        return;
      }
      if (this.showPartTypeColModal()) {
        this.closeColPartTypePicker();
        return;
      }
      if (this.showMaterialColModal()) {
        this.closeColMaterialPicker();
        return;
      }
      /* Форму товара закрываем только кнопками Отмена / Сохранить, не по Escape. */
      if (this.selectedProduct()) this.closeDetailsModal();
    }
    if (event.key !== 'Tab') return;
    const container = this.showModal()
      ? this.editModalPanel?.nativeElement
      : this.selectedProduct()
        ? this.detailsModalCard?.nativeElement
        : null;
    if (!container) return;
    this.trapTab(event, container);
  }

  private trapTab(event: KeyboardEvent, container: HTMLElement) {
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

  private unlockProductFormInteractionSoon() {
    setTimeout(() => this.productFormInteractionLocked.set(false), 1200);
  }

  private bumpQuickAddAction() {
    this.lastQuickAddActionAt.set(Date.now());
  }

  private isInQuickAddCooldown() {
    return Date.now() - this.lastQuickAddActionAt() < 1200;
  }
}
