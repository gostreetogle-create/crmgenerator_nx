// Eve-arch: 000 — без выделенного паттерна
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Category, Functionality, Material, MountType, PartType } from '@domain';
import { CategoriesApiService } from '../api/categories-api.service';
import { FunctionalitiesApiService } from '../api/functionalities-api.service';
import { MaterialsApiService } from '../api/materials-api.service';
import { MountTypesApiService } from '../api/mount-types-api.service';
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
  private readonly mountTypesApi = inject(MountTypesApiService);
  private readonly functionalitiesApi = inject(FunctionalitiesApiService);

  readonly categories = signal<Category[]>([]);
  readonly materials = signal<Material[]>([]);
  readonly partTypes = signal<PartType[]>([]);
  readonly mountTypes = signal<MountType[]>([]);
  readonly functionalities = signal<Functionality[]>([]);

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
        mountTypes: this.mountTypesApi.getAll(),
        functionalities: this.functionalitiesApi.getAll(),
      }).subscribe({
        next: ({ categories, materials, partTypes, mountTypes, functionalities }) => {
          this.categories.set(categories);
          this.materials.set(materials);
          this.partTypes.set(partTypes);
          this.mountTypes.set(mountTypes);
          this.functionalities.set(functionalities);
        },
        error: () => {
          this.categories.set(this.readLsCategories());
          this.materials.set(this.readLsMaterials());
          this.partTypes.set(this.readLsPartTypes());
          this.mountTypes.set(this.readLsMountTypes());
          this.functionalities.set(this.readLsFunctionalities());
        },
      });
      return;
    }

    this.categories.set(this.readLsCategories());
    this.materials.set(this.readLsMaterials());
    this.partTypes.set(this.readLsPartTypes());
    this.mountTypes.set(this.readLsMountTypes());
    this.functionalities.set(this.readLsFunctionalities());
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

  mountTypeName(id?: string): string {
    if (!id) return '—';
    return this.mountTypes().find((m) => m._id === id)?.name ?? id;
  }

  functionalityName(id?: string): string {
    if (!id) return '—';
    return this.functionalities().find((f) => f._id === id)?.name ?? id;
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

  private readLsMountTypes(): MountType[] {
    const saved = this.parseArray<MountType>(CATALOG_LS_KEYS.mountTypes);
    if (saved.length) return saved;
    return [
      { _id: 'mt-weld', name: 'Сварка', isActive: true },
      { _id: 'mt-bolt', name: 'Болтовое', isActive: true },
      { _id: 'mt-anchor', name: 'Анкерное', isActive: true },
    ];
  }

  private readLsFunctionalities(): Functionality[] {
    const saved = this.parseArray<Functionality>(CATALOG_LS_KEYS.functionalities);
    if (saved.length) return saved;
    return [
      { _id: 'fn-guard', name: 'Ограждение', isActive: true },
      { _id: 'fn-decor', name: 'Декор', isActive: true },
      { _id: 'fn-load', name: 'Несущая функция', isActive: true },
    ];
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
      mountTypes?: MountType[];
      functionalities?: Functionality[];
    } = {}
  ): void {
    if (partial.categories) this.categories.set([...partial.categories]);
    if (partial.materials) this.materials.set([...partial.materials]);
    if (partial.partTypes) this.partTypes.set([...partial.partTypes]);
    if (partial.mountTypes) this.mountTypes.set([...partial.mountTypes]);
    if (partial.functionalities) this.functionalities.set([...partial.functionalities]);
  }

  /** Повторная загрузка с API или из LS (после remote-создания справочника). */
  refresh(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.categoriesApi.isRemoteEnabled()) {
      forkJoin({
        categories: this.categoriesApi.getAll(),
        materials: this.materialsApi.getAll(),
        partTypes: this.partTypesApi.getAll(),
        mountTypes: this.mountTypesApi.getAll(),
        functionalities: this.functionalitiesApi.getAll(),
      }).subscribe({
        next: ({ categories, materials, partTypes, mountTypes, functionalities }) => {
          this.categories.set(categories);
          this.materials.set(materials);
          this.partTypes.set(partTypes);
          this.mountTypes.set(mountTypes);
          this.functionalities.set(functionalities);
        },
        error: () => {
          this.categories.set(this.readLsCategories());
          this.materials.set(this.readLsMaterials());
          this.partTypes.set(this.readLsPartTypes());
          this.mountTypes.set(this.readLsMountTypes());
          this.functionalities.set(this.readLsFunctionalities());
        },
      });
      return;
    }
    this.categories.set(this.readLsCategories());
    this.materials.set(this.readLsMaterials());
    this.partTypes.set(this.readLsPartTypes());
    this.mountTypes.set(this.readLsMountTypes());
    this.functionalities.set(this.readLsFunctionalities());
  }
}
