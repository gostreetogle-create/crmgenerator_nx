import fs from 'node:fs';
import path from 'node:path';
import { config as dotenvConfig } from 'dotenv';

// Поддержка двух окружений:
// - DEV: `.env.development`
// - PROD: `.env.production`
// Переключение: через `ENV_FILE` или `NODE_ENV`.
const nodeEnv = process.env.NODE_ENV ?? 'development';
const envFileFromVar = process.env.ENV_FILE;
const candidate = envFileFromVar
  ? envFileFromVar
  : `.env.${nodeEnv}`;

const envPath = path.resolve(process.cwd(), candidate);
const fallbackPath = path.resolve(process.cwd(), '.env');

const resolvedEnvPath = fs.existsSync(envPath) ? envPath : fallbackPath;
dotenvConfig({ path: resolvedEnvPath, override: true });

export const config = {
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  databaseUrl: process.env.DATABASE_URL ?? '',
  pdfRetentionDays: Number(process.env.PDF_RETENTION_DAYS ?? 30),
};

