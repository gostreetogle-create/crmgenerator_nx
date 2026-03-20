// Eve-BE: API-UTIL-002 — обёртка async route → catch(next) для Express
import type { RequestHandler } from 'express';

export const asyncHandler =
  (fn: (req: any, res: any, next: any) => Promise<any>): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

