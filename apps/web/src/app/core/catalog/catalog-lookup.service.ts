// Eve-arch: 000 — без выделенного паттерна
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Category, Material, PartType } from '@domain';
import { CategoriesApiService } from '../api/categories-api.service';
import { MaterialsApiService } from '../api/materials-api.service';
import { PartTypesApiService } from '../api/part-types-api.service';
import { CATALOG_LS_KEYS } from './catalog-storage-keys';

/**
 * Справочники каталога для форм товаров/спецификаций без импорта feature → feature.
 * Локально читает те же ключи LS, что `CategoriesService` / `MaterialsService` / `PartTypesService`.
 */
@Injectable({ providedIn: 'root' })
export class CatalogLookupService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly categoriesApi = inject(CategoriesApiService);
  private readonly materialsApi = inject(MaterialsApiService);
  private readonly partTypesApi = inject(PartTypesApiService);

  readonly categories = signal<Category[]>([]);
  readonly materials = signal<Material[]>([]);
  readonly partTypes = signal<PartType[]>([]);

  private loaded = false;

  /** Идемпотентно: один запрос к API или чтение LS. */
  ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.categoriesApi.isRemoteEnabled()) {
      forkJoin({
        categories: this.categoriesApi.getAll(),
        materials: this.materialsApi.getAll(),
        partTypes: this.partTypesApi.getAll(),
      }).subscribe({
        next: ({ categories, materials, partTypes }) => {
          this.categories.set(categories);
          this.materials.set(materials);
          this.partTypes.set(partTypes);
        },
        error: () => {
          this.categories.set(this.readLsCategories());
          this.materials.set(this.readLsMaterials());
          this.partTypes.set(this.readLsPartTypes());
        },
      });
      return;
    }

    this.categories.set(this.readLsCategories());
    this.materials.set(this.readLsMaterials());
    this.partTypes.set(this.readLsPartTypes());
  }

  categoryName(id?: string): string {
    if (!id) return '—';
    return this.categories().find((c) => c._id === id)?.name ?? id;
  }

  materialName(id?: string): string {
    if (!id) return '—';
    return this.materials().find((m) => m._id === id)?.name ?? id;
  }

  partTypeName(id?: string): string {
    if (!id) return '—';
    return this.partTypes().find((p) => p._id === id)?.name ?? id;
  }

  private readLsCategories(): Category[] {
    return this.parseArray<Category>(CATALOG_LS_KEYS.categories);
  }

  private readLsMaterials(): Material[] {
    return this.parseArray<Material>(CATALOG_LS_KEYS.materials);
  }

  private readLsPartTypes(): PartType[] {
    return this.parseArray<PartType>(CATALOG_LS_KEYS.partTypes);
  }

  private parseArray<T>(key: string): T[] {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  /** Подставить актуальные списки из feature-сервисов после быстрого CRUD (без перезагрузки страницы). */
  applyFromSignals(
    partial: {
      categories?: Category[];
      materials?: Material[];
      partTypes?: PartType[];
    } = {}
  ): void {
    if (partial.categories) this.categories.set([...partial.categories]);
    if (partial.materials) this.materials.set([...partial.materials]);
    if (partial.partTypes) this.partTypes.set([...partial.partTypes]);
  }

  /** Повторная загрузка с API или из LS (после remote-создания справочника). */
  refresh(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.categoriesApi.isRemoteEnabled()) {
      forkJoin({
        categories: this.categoriesApi.getAll(),
        materials: this.materialsApi.getAll(),
        partTypes: this.partTypesApi.getAll(),
      }).subscribe({
        next: ({ categories, materials, partTypes }) => {
          this.categories.set(categories);
          this.materials.set(materials);
          this.partTypes.set(partTypes);
        },
        error: () => {
          this.categories.set(this.readLsCategories());
          this.materials.set(this.readLsMaterials());
          this.partTypes.set(this.readLsPartTypes());
        },
      });
      return;
    }
    this.categories.set(this.readLsCategories());
    this.materials.set(this.readLsMaterials());
    this.partTypes.set(this.readLsPartTypes());
  }
}
