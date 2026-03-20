/** @jest-environment jsdom */
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MaterialsService } from './materials.service';
import { MaterialsApiService } from '../../core/api';
import type { Material } from '@domain';

const storageKey = 'crmgenerator_nx_materials_v1';

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

describe('MaterialsService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('when remote enabled, hydrates from getAll', () => {
    const api = createApiMock();
    api.isRemoteEnabled.mockReturnValue(true);
    const remoteList: Material[] = [{ _id: 'm1', name: 'Сталь' }];
    api.getAll.mockReturnValue(of(remoteList));
    TestBed.configureTestingModule({
      providers: [
        MaterialsService,
        { provide: MaterialsApiService, useValue: api },
      ],
    });
    const service = TestBed.inject(MaterialsService);
    expect(service.materials()).toEqual(remoteList);
  });

  it('when remote getAll fails, uses cache and listLoadError', () => {
    const cached: Material[] = [{ _id: 'c1', name: 'Кэш' }];
    window.localStorage.setItem(storageKey, JSON.stringify(cached));
    const api = createApiMock();
    api.isRemoteEnabled.mockReturnValue(true);
    api.getAll.mockReturnValue(throwError(() => new Error('fail')));
    TestBed.configureTestingModule({
      providers: [
        MaterialsService,
        { provide: MaterialsApiService, useValue: api },
      ],
    });
    const service = TestBed.inject(MaterialsService);
    expect(service.materials()).toEqual(cached);
    expect(service.listLoadError()).toBe('fail');
  });
});
