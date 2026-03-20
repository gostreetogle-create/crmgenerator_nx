// Eve-arch: 000 — без выделенного паттерна
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { Product } from '@domain';
import { ProductsApiService, httpErrorMessage } from '../../core/api';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly api = inject(ProductsApiService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly storageKey = 'crmgenerator_nx_products_v1';

  readonly products = signal<Product[]>(this.computeInitial());

  readonly listLoading = signal(false);
  readonly listLoadError = signal<string | null>(null);
  readonly mutationError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.api.isRemoteEnabled()) return;
      this.persistLocal(this.products());
    });

    if (isPlatformBrowser(this.platformId) && this.api.isRemoteEnabled()) {
      this.fetchRemoteList();
    }
  }

  refreshFromRemote(): void {
    if (!isPlatformBrowser(this.platformId) || !this.api.isRemoteEnabled()) return;
    this.fetchRemoteList();
  }

  dismissListLoadError(): void {
    this.listLoadError.set(null);
  }

  dismissMutationError(): void {
    this.mutationError.set(null);
  }

  private fetchRemoteList(): void {
    this.listLoading.set(true);
    this.listLoadError.set(null);
    this.api.getAll().subscribe({
      next: (list) => {
        this.products.set(list);
        this.persistRemoteCache(list);
        this.listLoading.set(false);
        this.listLoadError.set(null);
      },
      error: (err) => {
        console.error('[ProductsService] getAll failed', err);
        const fallback = this.loadFromLocalStorageOrSeed();
        this.products.set(fallback);
        this.listLoadError.set(httpErrorMessage(err));
        this.listLoading.set(false);
      },
    });
  }

  private computeInitial(): Product[] {
    if (!isPlatformBrowser(this.platformId)) return this.seed();
    if (this.api.isRemoteEnabled()) return [];
    return this.loadFromLocalStorageOrSeed();
  }

  private seed(): Product[] {
    return [
      {
        _id: 'prod1',
        name: 'Перила сварные',
        sku: 'PR-001',
        categoryId: 'cat1',
        partTypeId: 'pt1',
        materialId: 'mat1',
        isActive: true,
      },
    ];
  }

  private loadFromLocalStorageOrSeed(): Product[] {
    const seed = this.seed();
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return seed;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return seed;
      return parsed as Product[];
    } catch {
      return seed;
    }
  }

  private persistLocal(list: Product[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  private persistRemoteCache(list: Product[]) {
    this.persistLocal(list);
  }

  addProduct(data: Omit<Product, '_id'>) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const tempId = `__pending:${crypto.randomUUID()}`;
      const optimistic: Product = { ...data, _id: tempId };
      this.products.update((list) => [optimistic, ...list]);
      this.api.create(data).subscribe({
        next: (created) => {
          this.products.update((list) =>
            list.map((p) => (p._id === tempId ? created : p))
          );
          this.persistRemoteCache(this.products());
        },
        error: (err) => {
          console.error('[ProductsService] create failed', err);
          this.products.update((list) => list.filter((p) => p._id !== tempId));
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }
    this.products.update((list) => [
      { ...data, _id: crypto.randomUUID() },
      ...list,
    ]);
  }

  updateProduct(id: string, data: Partial<Product>) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const snapshot = this.products();
      this.products.update((list) =>
        list.map((p) => (p._id === id ? { ...p, ...data } : p))
      );
      this.api.update(id, data).subscribe({
        next: (updated) => {
          this.products.update((list) =>
            list.map((p) => (p._id === id ? updated : p))
          );
          this.persistRemoteCache(this.products());
        },
        error: (err) => {
          console.error('[ProductsService] update failed', err);
          this.products.set(snapshot);
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }
    this.products.update((list) =>
      list.map((p) => (p._id === id ? { ...p, ...data } : p))
    );
  }

  removeProduct(id: string) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const snapshotProducts = this.products();
      this.products.update((list) => list.filter((p) => p._id !== id));
      this.api.delete(id).subscribe({
        next: () => this.persistRemoteCache(this.products()),
        error: (err) => {
          console.error('[ProductsService] delete failed', err);
          this.products.set(snapshotProducts);
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }
    this.products.update((list) => list.filter((p) => p._id !== id));
  }
}
