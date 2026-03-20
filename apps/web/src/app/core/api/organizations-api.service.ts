// Eve-arch: 000 — без выделенного паттерна
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization } from '@domain';
import { APP_ENVIRONMENT } from './app-environment.token';

/**
 * HTTP-слой для организаций (истина — `docs/api/FRONTEND_CONTRACT.md`; расширения — `docs/api/API_FUTURE_CHECKLIST.md`).
 * Используется в `OrganizationsService`, когда `apiBaseUrl` задан.
 */
@Injectable({ providedIn: 'root' })
export class OrganizationsApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  /** true, если в environment задан базовый URL (можно переключать фичу на API). */
  isRemoteEnabled(): boolean {
    return Boolean(this.env.apiBaseUrl?.trim());
  }

  getAll(): Observable<Organization[]> {
    return this.http.get<Organization[]>('organizations');
  }

  getById(id: string): Observable<Organization> {
    return this.http.get<Organization>(`organizations/${encodeURIComponent(id)}`);
  }

  create(body: Omit<Organization, '_id'>): Observable<Organization> {
    return this.http.post<Organization>('organizations', body);
  }

  update(id: string, body: Partial<Organization>): Observable<Organization> {
    return this.http.patch<Organization>(
      `organizations/${encodeURIComponent(id)}`,
      body
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`organizations/${encodeURIComponent(id)}`);
  }
}
