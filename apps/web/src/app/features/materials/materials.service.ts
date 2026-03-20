import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { Material } from '@domain';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { MaterialsApiService, httpErrorMessage } from '../../core/api';

@Injectable({ providedIn: 'root' })
export class MaterialsService {
  private readonly api = inject(MaterialsApiService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly storageKey = 'crmgenerator_nx_materials_v1';

  readonly materials = signal<Material[]>(this.computeInitial());

  readonly listLoading = signal(false);
  readonly listLoadError = signal<string | null>(null);
  readonly mutationError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.api.isRemoteEnabled()) return;
      this.persistLocal(this.materials());
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
        this.materials.set(list);
        this.persistRemoteCache(list);
        this.listLoading.set(false);
        this.listLoadError.set(null);
      },
      error: (err) => {
        console.error('[MaterialsService] getAll failed', err);
        const fallback = this.loadFromLocalStorageOrSeed();
        this.materials.set(fallback);
        this.listLoadError.set(httpErrorMessage(err));
        this.listLoading.set(false);
      },
    });
  }

  private computeInitial(): Material[] {
    if (!isPlatformBrowser(this.platformId)) return this.seed();
    if (this.api.isRemoteEnabled()) return [];
    return this.loadFromLocalStorageOrSeed();
  }

  private seed(): Material[] {
    return [
      {
        _id: 'mat1',
        name: 'Сталь СТ3',
        code: 'ST3',
        isActive: true,
      },
    ];
  }

  private loadFromLocalStorageOrSeed(): Material[] {
    const seed = this.seed();
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return seed;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return seed;
      return parsed as Material[];
    } catch {
      return seed;
    }
  }

  private persistLocal(list: Material[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  private persistRemoteCache(list: Material[]) {
    this.persistLocal(list);
  }

  addMaterial(data: Omit<Material, '_id'>) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const tempId = `__pending:${crypto.randomUUID()}`;
      const optimistic: Material = { ...data, _id: tempId };
      this.materials.update((list) => [optimistic, ...list]);
      this.api.create(data).subscribe({
        next: (created) => {
          const normalized = this.normalizeMaterialId(created);
          this.materials.update((list) =>
            list.map((m) => (m._id === tempId ? normalized : m))
          );
          this.persistRemoteCache(this.materials());
        },
        error: (err) => {
          console.error('[MaterialsService] create failed', err);
          this.materials.update((list) => list.filter((m) => m._id !== tempId));
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }
    this.materials.update((list) => [
      { ...data, _id: crypto.randomUUID() },
      ...list,
    ]);
  }

  /** Создание материала из формы товара (см. CategoriesService.addCategoryForPicker). */
  addMaterialForPicker(data: Omit<Material, '_id'>): Observable<Material> {
    if (!this.api.isRemoteEnabled()) {
      const created: Material = { ...data, _id: crypto.randomUUID() };
      this.materials.update((list) => [created, ...list]);
      return of(created);
    }
    this.mutationError.set(null);
    return this.api.create(data).pipe(
      map((created) => this.normalizeMaterialId(created)),
      tap({
        next: (created) => {
          this.materials.update((list) => [created, ...list]);
          this.persistRemoteCache(this.materials());
        },
        error: (err) => {
          console.error('[MaterialsService] create (picker) failed', err);
          this.mutationError.set(httpErrorMessage(err));
        },
      }),
      catchError((err) => throwError(() => err))
    );
  }

  updateMaterial(id: string, data: Partial<Material>) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const snapshot = this.materials();
      this.materials.update((list) =>
        list.map((m) => (m._id === id ? { ...m, ...data } : m))
      );
      this.api.update(id, data).subscribe({
        next: (updated) => {
          this.materials.update((list) =>
            list.map((m) => (m._id === id ? updated : m))
          );
          this.persistRemoteCache(this.materials());
        },
        error: (err) => {
          console.error('[MaterialsService] update failed', err);
          this.materials.set(snapshot);
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }
    this.materials.update((list) =>
      list.map((m) => (m._id === id ? { ...m, ...data } : m))
    );
  }

  removeMaterial(id: string) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const snapshot = this.materials();
      this.materials.set(snapshot.filter((m) => m._id !== id));
      this.api.delete(id).subscribe({
        next: () => this.persistRemoteCache(this.materials()),
        error: (err) => {
          console.error('[MaterialsService] delete failed', err);
          this.materials.set(snapshot);
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }
    this.materials.update((list) => list.filter((m) => m._id !== id));
  }

  private normalizeMaterialId(material: Material): Material {
    if (material._id?.trim()) return material;
    const fallbackId = (material as Material & { id?: string }).id?.trim();
    return fallbackId ? { ...material, _id: fallbackId } : material;
  }
}
