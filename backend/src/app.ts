// Eve-BE: SEC-CORS-004 — CORS, лимит JSON body, static PDF из storage
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { config } from './config';
import { apiRouter } from './routes/api';
import { errorHandler } from './middlewares/errorHandler';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  // Небольшая “заглушка” для диагностики: чтобы не было 404 на /api
  app.get('/api', (_req, res) =>
    res.json({ ok: true, message: 'API is running', routes: ['/api/health'] }),
  );
  // Заглушка для корня: удобно не получать 404 при случайном открытии http://localhost:3000/
  app.get('/', (_req, res) => res.json({ ok: true, api: '/api', health: '/api/health' }));
  app.use('/api', apiRouter);

  // Раздача сгенерированных PDF.
  app.use(
    '/api/files',
    express.static(path.resolve(process.cwd(), 'storage', 'pdfs')),
  );

  app.use(errorHandler);
  return app;
};

