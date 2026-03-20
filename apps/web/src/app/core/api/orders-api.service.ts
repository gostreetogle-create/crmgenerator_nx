import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '@domain';
import { APP_ENVIRONMENT } from './app-environment.token';

/**
 * HTTP-слой для заказов (`docs/api/FRONTEND_CONTRACT.md`).
 * UI-слой пока может не использовать сервис, но контракт и типы синхронизированы.
 */
@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  isRemoteEnabled(): boolean {
    return Boolean(this.env.apiBaseUrl?.trim());
  }

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>('orders');
  }

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`orders/${encodeURIComponent(id)}`);
  }
}

