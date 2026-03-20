// Eve-arch: 000 — без выделенного паттерна
/** @jest-environment jsdom */
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PartTypesService } from './part-types.service';
import { PartTypesApiService } from '../../core/api';
import type { PartType } from '@domain';

const storageKey = 'crmgenerator_nx_part_types_v1';

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

describe('PartTypesService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('when remote enabled, hydrates from getAll', () => {
    const api = createApiMock();
    api.isRemoteEnabled.mockReturnValue(true);
    const remoteList: PartType[] = [{ _id: 'p1', name: 'Лист' }];
    api.getAll.mockReturnValue(of(remoteList));
    TestBed.configureTestingModule({
      providers: [
        PartTypesService,
        { provide: PartTypesApiService, useValue: api },
      ],
    });
    const service = TestBed.inject(PartTypesService);
    expect(service.partTypes()).toEqual(remoteList);
  });

  it('when remote getAll fails, uses cache and listLoadError', () => {
    const cached: PartType[] = [{ _id: 'c1', name: 'Кэш' }];
    window.localStorage.setItem(storageKey, JSON.stringify(cached));
    const api = createApiMock();
    api.isRemoteEnabled.mockReturnValue(true);
    api.getAll.mockReturnValue(throwError(() => new Error('fail')));
    TestBed.configureTestingModule({
      providers: [
        PartTypesService,
        { provide: PartTypesApiService, useValue: api },
      ],
    });
    const service = TestBed.inject(PartTypesService);
    expect(service.partTypes()).toEqual(cached);
    expect(service.listLoadError()).toBe('fail');
  });
});
