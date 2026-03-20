// Eve-arch: 000 — без выделенного паттерна
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { Client } from '@domain';
import { ClientsApiService, httpErrorMessage } from '../../core/api';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly api = inject(ClientsApiService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly storageKey = 'crmgenerator_nx_clients_v1';

  readonly clients = signal<Client[]>(this.computeInitialClients());

  readonly listLoading = signal(false);
  readonly listLoadError = signal<string | null>(null);
  readonly mutationError = signal<string | null>(null);

  constructor() {
    console.log('ClientsService init, clients =', this.clients());
    if (!this.clients().length) {
      this.clients.set([
        {
          _id: '1',
          name: 'Тестовый клиент',
          phone: '+7 (999) 123-45-67',
          inn: '1234567890',
          discount: 5,
        },
        {
          _id: '2',
          name: 'Другой заказчик',
          phone: '—',
          inn: '—',
          discount: 10,
        },
      ]);
      console.log('Сид загружен:', this.clients());
    }

    effect(() => {
      if (this.api.isRemoteEnabled()) return;
      this.saveClients(this.clients());
    });

    if (isPlatformBrowser(this.platformId) && this.api.isRemoteEnabled()) {
      this.fetchRemoteList();
    }
  }

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
        this.clients.set(list);
        this.persistRemoteCache(list);
        this.listLoading.set(false);
        this.listLoadError.set(null);
      },
      error: (err) => {
        console.error('[ClientsService] getAll failed', err);
        const fallback = this.loadFromLocalStorageOrSeed();
        this.clients.set(fallback);
        this.listLoadError.set(httpErrorMessage(err));
        this.listLoading.set(false);
      },
    });
  }

  private computeInitialClients(): Client[] {
    if (!isPlatformBrowser(this.platformId)) {
      return this.getSeedClients();
    }
    if (this.api.isRemoteEnabled()) {
      return [];
    }
    return this.loadFromLocalStorageOrSeed();
  }

  private getSeedClients(): Client[] {
    return [
      {
        _id: 'c1',
        name: 'ООО Альфа',
        contactPerson: 'Иван Петров',
        phone: '+7 900 111-22-33',
        email: 'alpha@example.com',
        inn: '7701234567',
        discount: 5,
        clientMarkup: 8,
        address: 'Москва, ул. Ленина, 1',
      },
      {
        _id: 'c2',
        name: 'ИП Смирнов',
        contactPerson: 'Смирнов Андрей',
        phone: '+7 900 222-33-44',
        email: 'smirnov@example.com',
        inn: '781234567890',
        discount: 3,
        clientMarkup: 10,
        notes: 'Постоянный клиент',
      },
      {
        _id: 'c3',
        name: 'АО Вектор',
        contactPerson: 'Мария Кузнецова',
        phone: '+7 900 333-44-55',
        email: 'vector@example.com',
        inn: '7723456789',
        kpp: '772301001',
        discount: 7,
        clientMarkup: 6,
        requisites: 'р/с 40702810...',
      },
    ];
  }

  private loadFromLocalStorageOrSeed(): Client[] {
    const seed = this.getSeedClients();
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return seed;

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return seed;

      return parsed as Client[];
    } catch {
      return seed;
    }
  }

  private saveClients(list: Client[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  private persistRemoteCache(list: Client[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  addClient(data: Omit<Client, '_id'>) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const tempId = `__pending:${crypto.randomUUID()}`;
      const optimistic: Client = { ...data, _id: tempId };
      this.clients.update((list) => [optimistic, ...list]);

      this.api.create(data).subscribe({
        next: (created) => {
          this.clients.update((list) =>
            list.map((c) => (c._id === tempId ? created : c))
          );
          this.persistRemoteCache(this.clients());
        },
        error: (err) => {
          console.error('[ClientsService] create failed', err);
          this.clients.update((list) => list.filter((c) => c._id !== tempId));
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }

    const newClient: Client = {
      ...data,
      _id: crypto.randomUUID(),
    };
    this.clients.update((list) => [newClient, ...list]);
  }

  updateClient(id: string, data: Partial<Client>) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const snapshot = this.clients();
      this.clients.update((list) =>
        list.map((c) => (c._id === id ? { ...c, ...data } : c))
      );

      this.api.update(id, data).subscribe({
        next: (updated) => {
          this.clients.update((list) =>
            list.map((c) => (c._id === id ? updated : c))
          );
          this.persistRemoteCache(this.clients());
        },
        error: (err) => {
          console.error('[ClientsService] update failed', err);
          this.clients.set(snapshot);
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }

    this.clients.update((list) =>
      list.map((c) => (c._id === id ? { ...c, ...data } : c))
    );
  }

  removeClient(id: string) {
    if (this.api.isRemoteEnabled()) {
      this.mutationError.set(null);
      const snapshot = this.clients();
      this.clients.set(snapshot.filter((c) => c._id !== id));

      this.api.delete(id).subscribe({
        next: () => {
          this.persistRemoteCache(this.clients());
        },
        error: (err) => {
          console.error('[ClientsService] delete failed', err);
          this.clients.set(snapshot);
          this.mutationError.set(httpErrorMessage(err));
        },
      });
      return;
    }

    this.clients.update((list) => list.filter((c) => c._id !== id));
  }
}
