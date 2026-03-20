// Eve-BE: API-MOUNT-001 — `/api` PDF jobs (pdf.controller)
import { Router } from 'express';
import { getPdfJob, previewProposalPdf } from '../controllers/pdf.controller';

export const pdfRouter = Router();

pdfRouter.post('/proposals/:id/preview-pdf', previewProposalPdf);
pdfRouter.get('/pdf-jobs/:jobId', getPdfJob);

