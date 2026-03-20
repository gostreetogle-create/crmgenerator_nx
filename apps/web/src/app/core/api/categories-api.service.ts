// Eve-arch: 000 — без выделенного паттерна
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '@domain';
import { APP_ENVIRONMENT } from './app-environment.token';

/**
 * HTTP-слой категорий товаров (`docs/api/FRONTEND_CONTRACT.md`).
 */
@Injectable({ providedIn: 'root' })
export class CategoriesApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  isRemoteEnabled(): boolean {
    return Boolean(this.env.apiBaseUrl?.trim());
  }

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>('categories');
  }

  getById(id: string): Observable<Category> {
    return this.http.get<Category>(`categories/${encodeURIComponent(id)}`);
  }

  create(body: Omit<Category, '_id'>): Observable<Category> {
    return this.http.post<Category>('categories', body);
  }

  update(id: string, body: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(
      `categories/${encodeURIComponent(id)}`,
      body
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`categories/${encodeURIComponent(id)}`);
  }
}
