// Eve-arch: 000 — без выделенного паттерна
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MountType } from '@domain';
import { APP_ENVIRONMENT } from './app-environment.token';

@Injectable({ providedIn: 'root' })
export class MountTypesApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  isRemoteEnabled(): boolean {
    return Boolean(this.env.apiBaseUrl?.trim());
  }

  getAll(): Observable<MountType[]> {
    return this.http.get<MountType[]>('mount-types');
  }
}
