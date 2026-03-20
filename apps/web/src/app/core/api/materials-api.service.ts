// Eve-arch: 000 — без выделенного паттерна
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Material } from '@domain';
import { APP_ENVIRONMENT } from './app-environment.token';

/**
 * HTTP-слой материалов (`docs/api/FRONTEND_CONTRACT.md`).
 */
@Injectable({ providedIn: 'root' })
export class MaterialsApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  isRemoteEnabled(): boolean {
    return Boolean(this.env.apiBaseUrl?.trim());
  }

  getAll(): Observable<Material[]> {
    return this.http.get<Material[]>('materials');
  }

  getById(id: string): Observable<Material> {
    return this.http.get<Material>(`materials/${encodeURIComponent(id)}`);
  }

  create(body: Omit<Material, '_id'>): Observable<Material> {
    return this.http.post<Material>('materials', body);
  }

  update(id: string, body: Partial<Material>): Observable<Material> {
    return this.http.patch<Material>(
      `materials/${encodeURIComponent(id)}`,
      body
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`materials/${encodeURIComponent(id)}`);
  }
}
