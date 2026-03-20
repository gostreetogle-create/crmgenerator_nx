// Eve-BE: API-CRUD-MOUNTTYPE-001 — CRUD типов монтажа
// Eve-BE: API-VALID-ZOD-002 — zod-схемы
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { getParamString } from '../utils/getParamString';

const createMountTypeSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateMountTypeSchema = createMountTypeSchema.partial().strict();

export const listMountTypes = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.mountType.findMany({ orderBy: { name: 'asc' } });
  return res.json(
    rows.map((r) => ({
      _id: r.id,
      name: r.name,
      description: r.description ?? undefined,
      isActive: r.isActive ?? undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  );
});

export const getMountTypeById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  const row = await prisma.mountType.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'MountType not found');
  return res.json({
    _id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    isActive: row.isActive ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

export const createMountType = asyncHandler(async (req: Request, res: Response) => {
  const body = createMountTypeSchema.parse(req.body);
  const row = await prisma.mountType.create({ data: body });
  return res.status(201).json({
    _id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    isActive: row.isActive ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

export const updateMountType = asyncHandler(async (req: Request, res: Response) => {
  const body = updateMountTypeSchema.parse(req.body);
  const id = getParamString(req.params.id, 'id');
  try {
    const row = await prisma.mountType.update({ where: { id }, data: body });
    return res.json({
      _id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'MountType not found');
    throw err;
  }
});

export const deleteMountType = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  try {
    await prisma.mountType.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'MountType not found');
    throw err;
  }
});

