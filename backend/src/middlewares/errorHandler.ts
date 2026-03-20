import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors/HttpError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message, code: err.code });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: err.flatten(),
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ message: 'Internal Server Error' });
};

