// Eve-arch: 000 — без выделенного паттерна
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '@domain';
import { APP_ENVIRONMENT } from './app-environment.token';

/**
 * HTTP-слой товаров (`docs/api/FRONTEND_CONTRACT.md`).
 */
@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  isRemoteEnabled(): boolean {
    return Boolean(this.env.apiBaseUrl?.trim());
  }

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>('products');
  }

  search(q: string): Observable<Product[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<Product[]>('products/search', { params });
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`products/${encodeURIComponent(id)}`);
  }

  create(body: Omit<Product, '_id'>): Observable<Product> {
    return this.http.post<Product>('products', body);
  }

  update(id: string, body: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(
      `products/${encodeURIComponent(id)}`,
      body
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`products/${encodeURIComponent(id)}`);
  }

  clone(id: string, body: Partial<Omit<Product, '_id'>> = {}): Observable<Product> {
    return this.http.post<Product>(`products/${encodeURIComponent(id)}/clone`, body);
  }
}
