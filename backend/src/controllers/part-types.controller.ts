// Eve-BE: API-CRUD-PARTTYPE-001 — CRUD типов деталей
// Eve-BE: API-VALID-ZOD-002 — zod-схемы
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { mapPartType } from '../utils/responseMappers';
import { getParamString } from '../utils/getParamString';

const createPartTypeSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updatePartTypeSchema = createPartTypeSchema.partial().strict();

export const listPartTypes = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.partType.findMany({ orderBy: { name: 'asc' } });
  return res.json(rows.map(mapPartType));
});

export const getPartTypeById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  const row = await prisma.partType.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'PartType not found');
  return res.json(mapPartType(row));
});

export const createPartType = asyncHandler(async (req: Request, res: Response) => {
  const body = createPartTypeSchema.parse(req.body);
  const row = await prisma.partType.create({ data: body });
  return res.status(201).json(mapPartType(row));
});

export const updatePartType = asyncHandler(async (req: Request, res: Response) => {
  const body = updatePartTypeSchema.parse(req.body);
  const id = getParamString(req.params.id, 'id');
  try {
    const row = await prisma.partType.update({
      where: { id },
      data: body,
    });
    return res.json(mapPartType(row));
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'PartType not found');
    throw err;
  }
});

export const deletePartType = asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = getParamString(req.params.id, 'id');
    await prisma.partType.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'PartType not found');
    throw err;
  }
});

