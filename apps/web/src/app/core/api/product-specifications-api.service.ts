import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductSpecification } from '@domain';
import { APP_ENVIRONMENT } from './app-environment.token';

export type ProductSpecificationCreate = Pick<
  ProductSpecification,
  'partTypeId'
> &
  Partial<Pick<ProductSpecification, 'materialId' | 'displayName' | 'isActive'>>;

/**
 * HTTP-слой спецификаций товара (`docs/api/FRONTEND_CONTRACT.md`).
 */
@Injectable({ providedIn: 'root' })
export class ProductSpecificationsApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  isRemoteEnabled(): boolean {
    return Boolean(this.env.apiBaseUrl?.trim());
  }

  private base(productId: string): string {
    return `products/${encodeURIComponent(productId)}/specifications`;
  }

  list(productId: string): Observable<ProductSpecification[]> {
    return this.http.get<ProductSpecification[]>(this.base(productId));
  }

  create(
    productId: string,
    body: ProductSpecificationCreate
  ): Observable<ProductSpecification> {
    return this.http.post<ProductSpecification>(this.base(productId), body);
  }

  update(
    productId: string,
    specId: string,
    body: Partial<ProductSpecificationCreate>
  ): Observable<ProductSpecification> {
    return this.http.patch<ProductSpecification>(
      `${this.base(productId)}/${encodeURIComponent(specId)}`,
      body
    );
  }

  delete(productId: string, specId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base(productId)}/${encodeURIComponent(specId)}`
    );
  }
}
