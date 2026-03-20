import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { Organization } from '@domain';
import { OrganizationsApiService, httpErrorMessage } from '../../core/api';

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  private readonly api = inject(OrganizationsApiService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly storageKey = 'crmgenerator_nx_organizations_v1';

  readonly organizations = signal<Organization[]>(this.computeInitialOrganizations());

  /** Загрузка списка с API (первичная или «Повторить»). */
  readonly listLoading = signal(false);

  /** Ошибка загрузки списка; данные могут быть из кэша LS / демо. */
  readonly listLoadError = signal<string | null>(null);

  /** Последняя ошибка create/update/delete (оптимистичный откат уже выполнен). */
  readonly mutationError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.api.isRemoteEnabled()) return;
      this.saveOrganizations(this.organizations());
    });

    if (isPlatformBrowser(this.platformId) && this.api.isRemoteEnabled()) {
      this.fetchRemoteList();
    }
  }

  /** Повторная загрузка списка с сервера. */
  refreshFromRemote(): void {
    if (!isPlatformBrowser(this.platformId) || !this.api.isRemoteEnabled()) {
      return;
    }
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
        this.organizations.set(list);
        this.persistRemoteCache(list);
        this.listLoading.set(false);
        this.listLoadError.set(null);
      },
      error: (err) => {
        console.error('[OrganizationsService] getAll failed', err);
        const fallback = this.loadFromLocalStorageOrSeed();
        this.organizations.set(fallback);
        this.listLoadError.set(httpErrorMessage(err));
        this.listLoading.set(false);
      },
    });
  }

  private computeInitialOrganizations(): Organization[] {
    if (!isPlatformBrowser(this.platformId)) {
      return this.getSeedOrganizations();
    }
    if (this.api.isRemoteEnabled()) {
      return [];
    }
    return this.loadFromLocalStorageOrSeed();
  }

  private getSeedOrganizations(): Organization[] {
    return [
      {
        _id: 'o1',
        name: 'ООО "СпортСтройЮг"',
        shortName: 'ООО «СпортСтройЮг»',
        fullName: 'Общество с ограниченной ответственностью «СпортСтройЮг»',
        inn: '2312308098',
        kpp: '231201001',
        ogrn: '1222300008358',
        legalAddress:
          '350065, г. Краснодар, ул. им. Валерия Гассия, д. 17, пом. 57, ком. 1',
        actualAddress: '350004, г. Краснодар, ул. Кожевенная, д. 54/2',
        phone: '8 (918) 633-91-91',
        email: 'sportstroy_yug@mail.ru',
        website: 'sportin-yug.ru',
        directorFio: 'Сизова Светлана Николаевна',
        directorPosition: 'Генеральный директор',
        directorActingOn: 'Действует на основании Устава',
        markup: 20,
        notes: 'Производство и поставка спортивного оборудования',
      },
    ];
  }

  private loadFromLocalStorageOrSeed(): Organization[] {
    const seed = this.getSeedOrganizations();
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return seed;

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return seed;

      return parsed as Organization[];
    } catch {
      return seed;
    }
  }

  private saveOrganizations(list: Organization[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  /** Кэш последнего успешного ответа API (тот же ключ, что и у локального режима). */
  private persistRemoteCache(list: Organization[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  addOrganization(data: Omit<Organization, '_id'>) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const tempId = `__pending:${crypto.randomUUID()}`;
      const optimistic: Organization = { ...data, _id: tempId };
      this.organizations.update((list) => [optimistic, ...list]);

      this.api.create(data).subscribe({
        next: (created) => {
          this.organizations.update((list) =>
            list.map((o) => (o._id === tempId ? created : o))
          );
          this.persistRemoteCache(this.organizations());
        },
        error: (err) => {
          console.error('[OrganizationsService] create failed', err);
          this.organizations.update((list) =>
            list.filter((o) => o._id !== tempId)
          );
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }

    const newOrg: Organization = {
      ...data,
      _id: crypto.randomUUID(),
    };
    this.organizations.update((list) => [newOrg, ...list]);
  }

  updateOrganization(id: string, data: Partial<Organization>) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const snapshot = this.organizations();
      this.organizations.update((list) =>
        list.map((o) => (o._id === id ? { ...o, ...data } : o))
      );

      this.api.update(id, data).subscribe({
        next: (updated) => {
          this.organizations.update((list) =>
            list.map((o) => (o._id === id ? updated : o))
          );
          this.persistRemoteCache(this.organizations());
        },
        error: (err) => {
          console.error('[OrganizationsService] update failed', err);
          this.organizations.set(snapshot);
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }

    this.organizations.update((list) =>
      list.map((o) => (o._id === id ? { ...o, ...data } : o))
    );
  }

  removeOrganization(id: string) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const snapshot = this.organizations();
      this.organizations.set(snapshot.filter((o) => o._id !== id));

      this.api.delete(id).subscribe({
        next: () => {
          this.persistRemoteCache(this.organizations());
        },
        error: (err) => {
          console.error('[OrganizationsService] delete failed', err);
          this.organizations.set(snapshot);
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }

    this.organizations.update((list) => list.filter((o) => o._id !== id));
  }
}
