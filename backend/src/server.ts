import { createApp } from './app';
import { config } from './config';
import { seedStatuses } from './seed';
import { startPdfStorageCleanupScheduler } from './utils/pdfStorageCleanup';

const app = createApp();

startPdfStorageCleanupScheduler(config.pdfRetentionDays);

seedStatuses()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('[seedStatuses] failed:', e);
  })
  .finally(() => {
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[api] listening on :${config.port}`);
    });
  });

