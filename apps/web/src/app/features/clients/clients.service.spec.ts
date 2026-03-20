/** @jest-environment jsdom */
import { TestBed } from '@angular/core/testing';
import { ClientsService } from './clients.service';
import type { Client } from '@domain';

const storageKey = 'crmgenerator_nx_clients_v1';

function getStoredClients(): Client[] {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];
  return JSON.parse(raw) as Client[];
}

describe('ClientsService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.resetTestingModule();
  });

  const flushEffects = async () =>
    new Promise<void>((resolve) => setTimeout(() => resolve(), 0));

  it('loads clients from localStorage when present', () => {
    const stored: Client[] = [{ _id: 'x1', name: 'Тестовый клиент' }];
    window.localStorage.setItem(storageKey, JSON.stringify(stored));

    TestBed.configureTestingModule({
      providers: [ClientsService],
    });

    const service = TestBed.inject(ClientsService);

    expect(service.clients().length).toBe(1);
    expect(service.clients()[0]._id).toBe('x1');
    expect(service.clients()[0].name).toBe('Тестовый клиент');
  });

  it('adds, updates and removes clients and persists changes', async () => {
    TestBed.configureTestingModule({
      providers: [ClientsService],
    });
    const service = TestBed.inject(ClientsService);

    const before = service.clients();
    expect(before.length).toBeGreaterThan(0);

    service.addClient({
      name: 'Новый клиент',
      inn: '7700000000',
      discount: 10,
    });

    await flushEffects();

    const afterAdd = service.clients();
    expect(afterAdd[0].name).toBe('Новый клиент');
    expect(getStoredClients()[0].name).toBe('Новый клиент');

    const id = afterAdd[0]._id;
    if (!id) throw new Error('Expected created client to have _id');
    service.updateClient(id, { discount: 42 });
    await flushEffects();

    const afterUpdate = service.clients().find((c) => c._id === id);
    expect(afterUpdate?.discount).toBe(42);
    expect(getStoredClients().find((c) => c._id === id)?.discount).toBe(42);

    service.removeClient(id);
    await flushEffects();

    expect(service.clients().some((c) => c._id === id)).toBe(false);
    expect(getStoredClients().some((c) => c._id === id)).toBe(false);
  });
});

