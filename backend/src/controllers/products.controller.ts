// Eve-BE: API-CRUD-PRODUCT-001 — товары: list/search/CRUD + clone (mounts/functionalities)
// Eve-BE: API-VALID-ZOD-002 — валидация тела/параметров через zod
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { mapProduct } from '../utils/responseMappers';
import { getParamString } from '../utils/getParamString';

const createProductSchema = z
  .object({
    name: z.string().min(1),
    sku: z.string().optional(),
    categoryId: z.string().optional(),
    partTypeId: z.string().optional(),
    materialId: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateProductSchema = createProductSchema.partial().strict();
const cloneProductSchema = createProductSchema.partial().strict();

export const listProducts = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.product.findMany({ orderBy: { name: 'asc' } });
  return res.json(rows.map(mapProduct));
});

export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const rawQ = req.query.q;
  const q =
    typeof rawQ === 'string'
      ? rawQ
      : Array.isArray(rawQ)
        ? rawQ[0]
        : undefined;
  const qParsed = z.string().optional().parse(q);
  if (!qParsed || !qParsed.trim()) {
    const rows = await prisma.product.findMany({ orderBy: { name: 'asc' } });
    return res.json(rows.map(mapProduct));
  }

  const qTrim = qParsed.trim();
  const rows = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: qTrim, mode: 'insensitive' } },
        { sku: { contains: qTrim, mode: 'insensitive' } },
        { notes: { contains: qTrim, mode: 'insensitive' } },
      ],
    },
    orderBy: { name: 'asc' },
  });
  return res.json(rows.map(mapProduct));
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  const row = await prisma.product.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'Product not found');
  return res.json(mapProduct(row));
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const body = createProductSchema.parse(req.body);
  const row = await prisma.product.create({ data: body });
  return res.status(201).json(mapProduct(row));
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const body = updateProductSchema.parse(req.body);
  const id = getParamString(req.params.id, 'id');
  try {
    const row = await prisma.product.update({
      where: { id },
      data: body,
    });
    return res.json(mapProduct(row));
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'Product not found');
    throw err;
  }
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = getParamString(req.params.id, 'id');
    await prisma.product.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'Product not found');
    throw err;
  }
});

export const cloneProduct = asyncHandler(async (req: Request, res: Response) => {
  const sourceId = getParamString(req.params.id, 'id');
  const body = cloneProductSchema.parse(req.body ?? {});

  const source = await prisma.product.findUnique({ where: { id: sourceId } });
  if (!source) throw new HttpError(404, 'Product not found');

  const cloned = await prisma.product.create({
    data: {
      name: body.name ?? source.name,
      sku: body.sku ?? source.sku,
      categoryId: body.categoryId ?? source.categoryId,
      partTypeId: body.partTypeId ?? source.partTypeId,
      materialId: body.materialId ?? source.materialId,
      notes: body.notes ?? source.notes,
      isActive: body.isActive ?? source.isActive,
    },
  });

  const mounts = await prisma.productMount.findMany({
    where: { productId: sourceId },
    select: { mountTypeId: true },
  });
  await Promise.all(
    mounts.map((m) =>
      prisma.productMount.create({
        data: { productId: cloned.id, mountTypeId: m.mountTypeId },
      }),
    ),
  );

  const functionalities = await prisma.productFunctionality.findMany({
    where: { productId: sourceId },
    select: { functionalityId: true },
  });
  await Promise.all(
    functionalities.map((f) =>
      prisma.productFunctionality.create({
        data: { productId: cloned.id, functionalityId: f.functionalityId },
      }),
    ),
  );

  return res.status(201).json(mapProduct(cloned));
});

