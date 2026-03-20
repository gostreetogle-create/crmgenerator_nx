import { Injectable, effect, signal } from '@angular/core';
import { Organization } from '@domain';

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  private readonly storageKey = 'crmgenerator_nx_organizations_v1';

  readonly organizations = signal<Organization[]>(this.loadInitialOrganizations());

  constructor() {
    effect(() => {
      this.saveOrganizations(this.organizations());
    });
  }

  private loadInitialOrganizations(): Organization[] {
    const seed: Organization[] = [
      {
        _id: 'o1',
        name: 'ООО "СпортСтройЮг"',
        shortName: 'ООО «СпортСтройЮг»',
        fullName: 'Общество с ограниченной ответственностью «СпортСтройЮг»',
        inn: '2312308098',
        kpp: '231201001',
        ogrn: '1222300008358',
        legalAddress: '350065, г. Краснодар, ул. им. Валерия Гассия, д. 17, пом. 57, ком. 1',
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

    if (typeof window === 'undefined') return seed;

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
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  addOrganization(data: Omit<Organization, '_id'>) {
    const newOrg: Organization = {
      ...data,
      _id: crypto.randomUUID(),
    };
    this.organizations.update((list) => [newOrg, ...list]);
  }

  updateOrganization(id: string, data: Partial<Organization>) {
    this.organizations.update((list) =>
      list.map((o) => (o._id === id ? { ...o, ...data } : o))
    );
  }

  removeOrganization(id: string) {
    this.organizations.update((list) => list.filter((o) => o._id !== id));
  }
}
