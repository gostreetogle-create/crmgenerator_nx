import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PartType } from '@domain';
import { APP_ENVIRONMENT } from './app-environment.token';

/**
 * HTTP-слой типов деталей / техописаний (`docs/api/FRONTEND_CONTRACT.md`).
 */
@Injectable({ providedIn: 'root' })
export class PartTypesApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  isRemoteEnabled(): boolean {
    return Boolean(this.env.apiBaseUrl?.trim());
  }

  getAll(): Observable<PartType[]> {
    return this.http.get<PartType[]>('part-types');
  }

  getById(id: string): Observable<PartType> {
    return this.http.get<PartType>(`part-types/${encodeURIComponent(id)}`);
  }

  create(body: Omit<PartType, '_id'>): Observable<PartType> {
    return this.http.post<PartType>('part-types', body);
  }

  update(id: string, body: Partial<PartType>): Observable<PartType> {
    return this.http.patch<PartType>(
      `part-types/${encodeURIComponent(id)}`,
      body
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`part-types/${encodeURIComponent(id)}`);
  }
}
