// Eve-arch: 000 — без выделенного паттерна
/** @jest-environment jsdom */
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CategoriesService } from './categories.service';
import { CategoriesApiService } from '../../core/api';
import type { Category } from '@domain';

const storageKey = 'crmgenerator_nx_categories_v1';

function createApiMock() {
  return {
    isRemoteEnabled: jest.fn(() => false),
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

describe('CategoriesService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.resetTestingModule();
  });

  const flushEffects = async () =>
    new Promise<void>((resolve) => setTimeout(() => resolve(), 0));

  it('loads from localStorage when present', () => {
    const stored: Category[] = [{ _id: 'x1', name: 'Тест' }];
    window.localStorage.setItem(storageKey, JSON.stringify(stored));
    TestBed.configureTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesApiService, useValue: createApiMock() },
      ],
    });
    const service = TestBed.inject(CategoriesService);
    expect(service.categories().length).toBe(1);
    expect(service.categories()[0].name).toBe('Тест');
  });

  it('adds, updates and removes and persists', async () => {
    TestBed.configureTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesApiService, useValue: createApiMock() },
      ],
    });
    const service = TestBed.inject(CategoriesService);
    service.addCategory({ name: 'Новая', isActive: true });
    await flushEffects();
    const id = service.categories()[0]._id;
    if (!id) throw new Error('id');
    service.updateCategory(id, { sortOrder: 5 });
    await flushEffects();
    expect(service.categories().find((c) => c._id === id)?.sortOrder).toBe(5);
    service.removeCategory(id);
    await flushEffects();
    expect(service.categories().some((c) => c._id === id)).toBe(false);
  });

  it('when remote enabled, hydrates from getAll and caches', async () => {
    const api = createApiMock();
    api.isRemoteEnabled.mockReturnValue(true);
    const remoteList: Category[] = [{ _id: 'srv1', name: 'С сервера' }];
    api.getAll.mockReturnValue(of(remoteList));
    TestBed.configureTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesApiService, useValue: api },
      ],
    });
    const service = TestBed.inject(CategoriesService);
    expect(api.getAll).toHaveBeenCalled();
    expect(service.categories()).toEqual(remoteList);
    const raw = window.localStorage.getItem(storageKey);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw as string)).toEqual(remoteList);
  });

  it('when remote getAll fails, falls back to cache and sets listLoadError', () => {
    const cached: Category[] = [{ _id: 'cached', name: 'Из кэша' }];
    window.localStorage.setItem(storageKey, JSON.stringify(cached));
    const api = createApiMock();
    api.isRemoteEnabled.mockReturnValue(true);
    api.getAll.mockReturnValue(throwError(() => new Error('network down')));
    TestBed.configureTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesApiService, useValue: api },
      ],
    });
    const service = TestBed.inject(CategoriesService);
    expect(service.categories()).toEqual(cached);
    expect(service.listLoadError()).toBe('network down');
  });
});
