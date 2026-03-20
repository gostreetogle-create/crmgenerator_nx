import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from '@domain';
import { APP_ENVIRONMENT } from './app-environment.token';

/**
 * HTTP-слой для клиентов (`docs/api/FRONTEND_CONTRACT.md`; backlog — `docs/api/API_FUTURE_CHECKLIST.md`).
 */
@Injectable({ providedIn: 'root' })
export class ClientsApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  isRemoteEnabled(): boolean {
    return Boolean(this.env.apiBaseUrl?.trim());
  }

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>('clients');
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`clients/${encodeURIComponent(id)}`);
  }

  create(body: Omit<Client, '_id'>): Observable<Client> {
    return this.http.post<Client>('clients', body);
  }

  update(id: string, body: Partial<Client>): Observable<Client> {
    return this.http.patch<Client>(`clients/${encodeURIComponent(id)}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`clients/${encodeURIComponent(id)}`);
  }
}
