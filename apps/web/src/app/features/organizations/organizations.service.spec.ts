/** @jest-environment jsdom */
import { TestBed } from '@angular/core/testing';
import { OrganizationsService } from './organizations.service';
import type { Organization } from '@domain';

const storageKey = 'crmgenerator_nx_organizations_v1';

function getStoredOrganizations(): Organization[] {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];
  return JSON.parse(raw) as Organization[];
}

describe('OrganizationsService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.resetTestingModule();
  });

  const flushEffects = async () =>
    new Promise<void>((resolve) => setTimeout(() => resolve(), 0));

  it('loads organizations from localStorage when present', () => {
    const stored: Organization[] = [{ _id: 'x1', name: 'Тестовая организация' }];
    window.localStorage.setItem(storageKey, JSON.stringify(stored));

    TestBed.configureTestingModule({
      providers: [OrganizationsService],
    });

    const service = TestBed.inject(OrganizationsService);

    expect(service.organizations().length).toBe(1);
    expect(service.organizations()[0]._id).toBe('x1');
    expect(service.organizations()[0].name).toBe('Тестовая организация');
  });

  it('adds, updates and removes organizations and persists changes', async () => {
    TestBed.configureTestingModule({
      providers: [OrganizationsService],
    });
    const service = TestBed.inject(OrganizationsService);

    const before = service.organizations();
    expect(before.length).toBeGreaterThan(0);

    service.addOrganization({
      name: 'Новая организация',
      inn: '7700000000',
      markup: 20,
    });

    await flushEffects();

    const afterAdd = service.organizations();
    expect(afterAdd[0].name).toBe('Новая организация');
    expect(getStoredOrganizations()[0].name).toBe('Новая организация');

    const id = afterAdd[0]._id;
    if (!id) throw new Error('Expected created organization to have _id');
    service.updateOrganization(id, { markup: 25 });
    await flushEffects();

    const afterUpdate = service.organizations().find((o) => o._id === id);
    expect(afterUpdate?.markup).toBe(25);
    expect(getStoredOrganizations().find((o) => o._id === id)?.markup).toBe(25);

    service.removeOrganization(id);
    await flushEffects();

    expect(service.organizations().some((o) => o._id === id)).toBe(false);
    expect(getStoredOrganizations().some((o) => o._id === id)).toBe(false);
  });
});
