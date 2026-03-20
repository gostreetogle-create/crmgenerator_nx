import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_ENVIRONMENT } from './app-environment.token';

/**
 * Добавляет `environment.apiBaseUrl` к относительным URL (`organizations`, `/clients`).
 * Абсолютные `http(s)://` не трогает.
 */
export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(APP_ENVIRONMENT);
  const base = env.apiBaseUrl?.trim() ?? '';
  if (!base || req.url.startsWith('http://') || req.url.startsWith('https://')) {
    return next(req);
  }
  const path = req.url.startsWith('/') ? req.url.slice(1) : req.url;
  const url = `${base.replace(/\/$/, '')}/${path}`;
  return next(req.clone({ url }));
};
