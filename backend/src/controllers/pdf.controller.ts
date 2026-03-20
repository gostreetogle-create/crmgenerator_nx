import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import PDFDocument from 'pdfkit';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { getParamString } from '../utils/getParamString';

type PdfJobStatus = 'queued' | 'running' | 'done' | 'failed';

type PdfJob = {
  jobId: string;
  status: PdfJobStatus;
  createdAt: number;
  updatedAt: number;
  error?: string;
  fileName?: string;
};

const jobs = new Map<string, PdfJob>();
const proposalLatestJob = new Map<string, string>(); // proposalId -> last jobId

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storageDir = path.resolve(process.cwd(), 'storage', 'pdfs');
ensureDir(storageDir);

function fileUrl(fileName: string) {
  // Frontend ожидает относительный URL, базу подставит apiBaseUrl интерцептором.
  return `/api/files/${encodeURIComponent(fileName)}`;
}

async function generateProposalPdf(jobId: string, proposalId: string) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    job.status = 'running';
    job.updatedAt = Date.now();

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        currentVersion: {
          include: {
            status: true,
            items: {
              orderBy: { lineNo: 'asc' },
              include: {
                mounts: { include: { mountType: true } },
                functionalities: { include: { functionality: true } },
              },
            },
          },
        },
      },
    });

    if (!proposal || !proposal.currentVersion) {
      throw new HttpError(404, 'Proposal not found');
    }

    const fileName = `${jobId}.pdf`;
    const filePath = path.join(storageDir, fileName);

    // Сгенерируем максимально простой PDF (MVP): шапка + строки позиций.
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text(`Proposal PDF`, { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Proposal ID: ${proposal.id}`);
    doc.text(`Version: ${proposal.currentVersion.versionNo}`);
    doc.text(`Status: ${proposal.currentVersion.status.key}`);
    doc.moveDown(1);

    doc.fontSize(12).text('Items:');
    doc.moveDown(0.5);

    for (const it of proposal.currentVersion.items) {
      const mounts = it.mounts.map((m: any) => m.mountType?.name).filter(Boolean).join(', ');
      const funs = it.functionalities
        .map((f: any) => f.functionality?.name)
        .filter(Boolean)
        .join(', ');

      doc
        .fontSize(11)
        .text(
          `#${it.lineNo} ${it.title} | qty: ${it.quantity ?? '-'} ${it.unit ?? ''} | price: ${it.unitPrice ?? '-'} | mounts: ${mounts || '-'} | functions: ${funs || '-'}`,
        );
    }

    doc.end();

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', () => resolve());
      stream.on('error', reject);
    });

    job.status = 'done';
    job.updatedAt = Date.now();
    job.fileName = fileName;
    proposalLatestJob.set(proposalId, jobId);
  } catch (e: any) {
    const msg = e instanceof HttpError ? e.message : e?.message ?? String(e);
    job.status = 'failed';
    job.updatedAt = Date.now();
    job.error = msg;
  }
}

export const previewProposalPdf = asyncHandler(async (req: Request, res: Response) => {
  const proposalId = getParamString(req.params.id, 'id');
  if (!proposalId) throw new HttpError(400, 'proposalId is required');

  const existing = proposalLatestJob.get(proposalId);
  if (existing) {
    const job = jobs.get(existing);
    // Если уже done — можно вернуть ссылку сразу.
    if (job?.status === 'done' && job.fileName) {
      return res.json({ jobId: job.jobId, status: job.status, pdfUrl: fileUrl(job.fileName) });
    }
    // Если running/queued — вернём jobId.
    if (job?.status === 'queued' || job?.status === 'running') {
      return res.status(202).json({ jobId: job.jobId, status: job.status });
    }
  }

  const jobId = randomUUID();
  jobs.set(jobId, {
    jobId,
    status: 'queued',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Запускаем генерацию “фоном”, но в одном процессе (MVP).
  void generateProposalPdf(jobId, proposalId);

  return res.status(202).json({ jobId, status: 'queued' });
});

export const getPdfJob = asyncHandler(async (req: Request, res: Response) => {
  const jobId = getParamString(req.params.jobId, 'jobId');
  if (!jobId) throw new HttpError(400, 'jobId is required');

  const job = jobs.get(jobId);
  if (!job) throw new HttpError(404, 'Pdf job not found');

  if (job.status === 'done' && job.fileName) {
    return res.json({
      jobId: job.jobId,
      status: job.status,
      pdfUrl: fileUrl(job.fileName),
    });
  }

  return res.json({
    jobId: job.jobId,
    status: job.status,
    error: job.error,
  });
});

