// Eve-BE: API-UTIL-002 — обёртка async route → catch(next) для Express
import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';

export const asyncHandler =
  (
    fn: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<unknown>
  ): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

