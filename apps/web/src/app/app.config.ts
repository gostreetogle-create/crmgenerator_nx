// Eve-arch: API-005 — провайдер APP_ENVIRONMENT для interceptor (см. core/api)
// Eve-SEC: SEC-ENV-API-001 — apiBaseUrl только из environment, не из пользовательского ввода
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { environment } from '../environments/environment';
import {
  APP_ENVIRONMENT,
  apiBaseUrlInterceptor,
} from './core/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    {
      provide: APP_ENVIRONMENT,
      useValue: {
        production: environment.production,
        apiBaseUrl: environment.apiBaseUrl?.trim() ?? '',
      },
    },
    provideHttpClient(withFetch(), withInterceptors([apiBaseUrlInterceptor])),
  ],
};
