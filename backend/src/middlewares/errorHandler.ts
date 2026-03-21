// Eve-BE: ERROR-HANDLER-003 — HttpError/Zod/500 → JSON клиенту без stack; 500 → console.error
import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
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

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message,
      code: 'UPLOAD_ERROR',
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ message: 'Internal Server Error' });
};

