// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-CATEGORIES-CRUD-001 — категории товаров: список, CRUD, optional API
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { Category } from '@domain';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { CategoriesApiService, httpErrorMessage } from '../../core/api';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly api = inject(CategoriesApiService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly storageKey = 'crmgenerator_nx_categories_v1';

  readonly categories = signal<Category[]>(this.computeInitial());

  readonly listLoading = signal(false);
  readonly listLoadError = signal<string | null>(null);
  readonly mutationError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.api.isRemoteEnabled()) return;
      this.persistLocal(this.categories());
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
        this.categories.set(list);
        this.persistRemoteCache(list);
        this.listLoading.set(false);
        this.listLoadError.set(null);
      },
      error: (err) => {
        console.error('[CategoriesService] getAll failed', err);
        const fallback = this.loadFromLocalStorageOrSeed();
        this.categories.set(fallback);
        this.listLoadError.set(httpErrorMessage(err));
        this.listLoading.set(false);
      },
    });
  }

  private computeInitial(): Category[] {
    if (!isPlatformBrowser(this.platformId)) return this.seed();
    if (this.api.isRemoteEnabled()) return [];
    return this.loadFromLocalStorageOrSeed();
  }

  private seed(): Category[] {
    return [
      {
        _id: 'cat1',
        name: 'Металлоконструкции',
        sortOrder: 0,
        isActive: true,
      },
    ];
  }

  private loadFromLocalStorageOrSeed(): Category[] {
    const seed = this.seed();
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return seed;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return seed;
      return parsed as Category[];
    } catch {
      return seed;
    }
  }

  private persistLocal(list: Category[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  private persistRemoteCache(list: Category[]) {
    this.persistLocal(list);
  }

  addCategory(data: Omit<Category, '_id'>) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const tempId = `__pending:${crypto.randomUUID()}`;
      const optimistic: Category = { ...data, _id: tempId };
      this.categories.update((list) => [optimistic, ...list]);
      this.api.create(data).subscribe({
        next: (created) => {
          const normalized = this.normalizeCategoryId(created);
          this.categories.update((list) =>
            list.map((c) => (c._id === tempId ? normalized : c))
          );
          this.persistRemoteCache(this.categories());
        },
        error: (err) => {
          console.error('[CategoriesService] create failed', err);
          this.categories.update((list) => list.filter((c) => c._id !== tempId));
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }
    this.categories.update((list) => [
      { ...data, _id: crypto.randomUUID() },
      ...list,
    ]);
  }

  /**
   * Создание категории из формы товара: без optimistic temp id; remote — ждём ответ API.
   */
  addCategoryForPicker(data: Omit<Category, '_id'>): Observable<Category> {
    if (!this.api.isRemoteEnabled()) {
      const created: Category = { ...data, _id: crypto.randomUUID() };
      this.categories.update((list) => [created, ...list]);
      return of(created);
    }
    this.mutationError.set(null);
    return this.api.create(data).pipe(
      map((created) => this.normalizeCategoryId(created)),
      tap({
        next: (created) => {
          this.categories.update((list) => [created, ...list]);
          this.persistRemoteCache(this.categories());
        },
        error: (err) => {
          console.error('[CategoriesService] create (picker) failed', err);
          this.mutationError.set(httpErrorMessage(err));
        },
      }),
      catchError((err) => throwError(() => err))
    );
  }

  updateCategory(id: string, data: Partial<Category>) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const snapshot = this.categories();
      this.categories.update((list) =>
        list.map((c) => (c._id === id ? { ...c, ...data } : c))
      );
      this.api.update(id, data).subscribe({
        next: (updated) => {
          this.categories.update((list) =>
            list.map((c) => (c._id === id ? updated : c))
          );
          this.persistRemoteCache(this.categories());
        },
        error: (err) => {
          console.error('[CategoriesService] update failed', err);
          this.categories.set(snapshot);
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }
    this.categories.update((list) =>
      list.map((c) => (c._id === id ? { ...c, ...data } : c))
    );
  }

  removeCategory(id: string) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const snapshot = this.categories();
      this.categories.set(snapshot.filter((c) => c._id !== id));
      this.api.delete(id).subscribe({
        next: () => this.persistRemoteCache(this.categories()),
        error: (err) => {
          console.error('[CategoriesService] delete failed', err);
          this.categories.set(snapshot);
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }
    this.categories.update((list) => list.filter((c) => c._id !== id));
  }

  private normalizeCategoryId(category: Category): Category {
    if (category._id?.trim()) return category;
    const fallbackId = (category as Category & { id?: string }).id?.trim();
    return fallbackId ? { ...category, _id: fallbackId } : category;
  }
}
