/** @jest-environment jsdom */
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ClientsService } from './clients.service';
import { ClientsApiService } from '../../core/api';
import type { Client } from '@domain';

const storageKey = 'crmgenerator_nx_clients_v1';

function getStoredClients(): Client[] {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];
  return JSON.parse(raw) as Client[];
}

function createClientsApiMock() {
  return {
    isRemoteEnabled: jest.fn(() => false),
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
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
      providers: [
        ClientsService,
        { provide: ClientsApiService, useValue: createClientsApiMock() },
      ],
    });

    const service = TestBed.inject(ClientsService);

    expect(service.clients().length).toBe(1);
    expect(service.clients()[0]._id).toBe('x1');
    expect(service.clients()[0].name).toBe('Тестовый клиент');
  });

  it('adds, updates and removes clients and persists changes', async () => {
    TestBed.configureTestingModule({
      providers: [
        ClientsService,
        { provide: ClientsApiService, useValue: createClientsApiMock() },
      ],
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

  it('when remote enabled, hydrates from getAll and does not write localStorage', async () => {
    const api = createClientsApiMock();
    api.isRemoteEnabled.mockReturnValue(true);
    const remoteList: Client[] = [{ _id: 'srv1', name: 'С сервера' }];
    api.getAll.mockReturnValue(of(remoteList));

    TestBed.configureTestingModule({
      providers: [
        ClientsService,
        { provide: ClientsApiService, useValue: api },
      ],
    });

    const service = TestBed.inject(ClientsService);

    expect(api.getAll).toHaveBeenCalled();
    expect(service.clients()).toEqual(remoteList);
    expect(service.listLoading()).toBe(false);
    expect(service.listLoadError()).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(storageKey)!)).toEqual(
      remoteList
    );
  });

  it('when remote getAll fails, falls back to localStorage and sets listLoadError', () => {
    const cached: Client[] = [{ _id: 'cached', name: 'Из кэша' }];
    window.localStorage.setItem(storageKey, JSON.stringify(cached));

    const api = createClientsApiMock();
    api.isRemoteEnabled.mockReturnValue(true);
    api.getAll.mockReturnValue(throwError(() => new Error('network down')));

    TestBed.configureTestingModule({
      providers: [
        ClientsService,
        { provide: ClientsApiService, useValue: api },
      ],
    });

    const service = TestBed.inject(ClientsService);

    expect(service.clients()).toEqual(cached);
    expect(service.listLoadError()).toBe('network down');
    expect(service.listLoading()).toBe(false);
  });
});
