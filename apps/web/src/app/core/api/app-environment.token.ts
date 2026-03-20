// Eve-arch: 000 — без выделенного паттерна
import { InjectionToken } from '@angular/core';
import type { AppEnvironment } from './app-environment.model';

export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT');
