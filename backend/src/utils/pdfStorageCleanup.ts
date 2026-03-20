// Eve-BE: LOG-ERROR-005 — фоновая очистка старых PDF в storage
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_PDF_RETENTION_DAYS = 30;

function getStorageDir() {
  return path.resolve(process.cwd(), 'storage', 'pdfs');
}

function shouldKeepByRetention(fileMtimeMs: number, retentionDays: number) {
  const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - retentionMs;
  return fileMtimeMs >= cutoff;
}

export function cleanupOldPdfs(retentionDays = DEFAULT_PDF_RETENTION_DAYS) {
  const dir = getStorageDir();
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  for (const name of files) {
    if (!name.toLowerCase().endsWith('.pdf')) continue;

    const filePath = path.join(dir, name);
    let stat: fs.Stats;
    try {
      stat = fs.statSync(filePath);
    } catch {
      continue;
    }

    if (shouldKeepByRetention(stat.mtimeMs, retentionDays)) continue;

    try {
      fs.unlinkSync(filePath);
    } catch {
      // не ломаем сервер из-за проблем с файлом
    }
  }
}

export function startPdfStorageCleanupScheduler(retentionDays: number, intervalMs?: number) {
  const effectiveRetentionDays = retentionDays ?? DEFAULT_PDF_RETENTION_DAYS;
  const effectiveIntervalMs = intervalMs ?? 24 * 60 * 60 * 1000; // раз в сутки

  // Один раз сразу при старте — чтобы “устаканить” накопившееся.
  try {
    cleanupOldPdfs(effectiveRetentionDays);
  } catch {
    // ignore
  }

  // Дальше — регулярная чистка.
  setInterval(() => {
    try {
      cleanupOldPdfs(effectiveRetentionDays);
    } catch {
      // ignore
    }
  }, effectiveIntervalMs).unref?.();
}

