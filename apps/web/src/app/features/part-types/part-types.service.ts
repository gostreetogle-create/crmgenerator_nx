// Eve-arch: 000 — без выделенного паттерна
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { PartType } from '@domain';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { PartTypesApiService, httpErrorMessage } from '../../core/api';

@Injectable({ providedIn: 'root' })
export class PartTypesService {
  private readonly api = inject(PartTypesApiService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly storageKey = 'crmgenerator_nx_part_types_v1';

  readonly partTypes = signal<PartType[]>(this.computeInitial());

  readonly listLoading = signal(false);
  readonly listLoadError = signal<string | null>(null);
  readonly mutationError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.api.isRemoteEnabled()) return;
      this.persistLocal(this.partTypes());
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
        this.partTypes.set(list);
        this.persistRemoteCache(list);
        this.listLoading.set(false);
        this.listLoadError.set(null);
      },
      error: (err) => {
        console.error('[PartTypesService] getAll failed', err);
        const fallback = this.loadFromLocalStorageOrSeed();
        this.partTypes.set(fallback);
        this.listLoadError.set(httpErrorMessage(err));
        this.listLoading.set(false);
      },
    });
  }

  private computeInitial(): PartType[] {
    if (!isPlatformBrowser(this.platformId)) return this.seed();
    if (this.api.isRemoteEnabled()) return [];
    return this.loadFromLocalStorageOrSeed();
  }

  private seed(): PartType[] {
    return [
      {
        _id: 'pt1',
        name: 'Лист горячекатаный',
        description: 'По ГОСТ 19903',
        isActive: true,
      },
    ];
  }

  private loadFromLocalStorageOrSeed(): PartType[] {
    const seed = this.seed();
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return seed;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return seed;
      return parsed as PartType[];
    } catch {
      return seed;
    }
  }

  private persistLocal(list: PartType[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  private persistRemoteCache(list: PartType[]) {
    this.persistLocal(list);
  }

  addPartType(data: Omit<PartType, '_id'>) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const tempId = `__pending:${crypto.randomUUID()}`;
      const optimistic: PartType = { ...data, _id: tempId };
      this.partTypes.update((list) => [optimistic, ...list]);
      this.api.create(data).subscribe({
        next: (created) => {
          const normalized = this.normalizePartTypeId(created);
          this.partTypes.update((list) =>
            list.map((p) => (p._id === tempId ? normalized : p))
          );
          this.persistRemoteCache(this.partTypes());
        },
        error: (err) => {
          console.error('[PartTypesService] create failed', err);
          this.partTypes.update((list) => list.filter((p) => p._id !== tempId));
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }
    this.partTypes.update((list) => [
      { ...data, _id: crypto.randomUUID() },
      ...list,
    ]);
  }

  /** Создание типа детали из формы товара (см. CategoriesService.addCategoryForPicker). */
  addPartTypeForPicker(data: Omit<PartType, '_id'>): Observable<PartType> {
    if (!this.api.isRemoteEnabled()) {
      const created: PartType = { ...data, _id: crypto.randomUUID() };
      this.partTypes.update((list) => [created, ...list]);
      return of(created);
    }
    this.mutationError.set(null);
    return this.api.create(data).pipe(
      map((created) => this.normalizePartTypeId(created)),
      tap({
        next: (created) => {
          this.partTypes.update((list) => [created, ...list]);
          this.persistRemoteCache(this.partTypes());
        },
        error: (err) => {
          console.error('[PartTypesService] create (picker) failed', err);
          this.mutationError.set(httpErrorMessage(err));
        },
      }),
      catchError((err) => throwError(() => err))
    );
  }

  updatePartType(id: string, data: Partial<PartType>) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const snapshot = this.partTypes();
      this.partTypes.update((list) =>
        list.map((p) => (p._id === id ? { ...p, ...data } : p))
      );
      this.api.update(id, data).subscribe({
        next: (updated) => {
          this.partTypes.update((list) =>
            list.map((p) => (p._id === id ? updated : p))
          );
          this.persistRemoteCache(this.partTypes());
        },
        error: (err) => {
          console.error('[PartTypesService] update failed', err);
          this.partTypes.set(snapshot);
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }
    this.partTypes.update((list) =>
      list.map((p) => (p._id === id ? { ...p, ...data } : p))
    );
  }

  removePartType(id: string) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const snapshot = this.partTypes();
      this.partTypes.set(snapshot.filter((p) => p._id !== id));
      this.api.delete(id).subscribe({
        next: () => this.persistRemoteCache(this.partTypes()),
        error: (err) => {
          console.error('[PartTypesService] delete failed', err);
          this.partTypes.set(snapshot);
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }
    this.partTypes.update((list) => list.filter((p) => p._id !== id));
  }

  private normalizePartTypeId(partType: PartType): PartType {
    if (partType._id?.trim()) return partType;
    const fallbackId = (partType as PartType & { id?: string }).id?.trim();
    return fallbackId ? { ...partType, _id: fallbackId } : partType;
  }
}
