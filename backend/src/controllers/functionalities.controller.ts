import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { getParamString } from '../utils/getParamString';

const createFunctionalitySchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateFunctionalitySchema = createFunctionalitySchema.partial().strict();

export const listFunctionalities = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.functionality.findMany({ orderBy: { name: 'asc' } });
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

export const getFunctionalityById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  const row = await prisma.functionality.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'Functionality not found');
  return res.json({
    _id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    isActive: row.isActive ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

export const createFunctionality = asyncHandler(async (req: Request, res: Response) => {
  const body = createFunctionalitySchema.parse(req.body);
  const row = await prisma.functionality.create({ data: body });
  return res.status(201).json({
    _id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    isActive: row.isActive ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

export const updateFunctionality = asyncHandler(async (req: Request, res: Response) => {
  const body = updateFunctionalitySchema.parse(req.body);
  const id = getParamString(req.params.id, 'id');
  try {
    const row = await prisma.functionality.update({ where: { id }, data: body });
    return res.json({
      _id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'Functionality not found');
    throw err;
  }
});

export const deleteFunctionality = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  try {
    await prisma.functionality.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'Functionality not found');
    throw err;
  }
});

