// Eve-BE: API-CRUD-PRODUCT-SPEC-001 — вложенный CRUD спецификаций товара
// Eve-BE: API-VALID-ZOD-002 — валидация тела/параметров через zod
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { getParamString } from '../utils/getParamString';

const createProductSpecificationSchema = z
  .object({
    materialId: z.string().min(1).optional(),
    partTypeId: z.string().min(1),
    displayName: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateProductSpecificationSchema = createProductSpecificationSchema.partial().strict();

const mapProductSpecification = (row: {
  id: string;
  productId: string;
  materialId: string | null;
  partTypeId: string;
  displayName: string | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  _id: row.id,
  productId: row.productId,
  materialId: row.materialId ?? undefined,
  partTypeId: row.partTypeId,
  displayName: row.displayName ?? undefined,
  isActive: row.isActive ?? undefined,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const ensureProductExists = async (productId: string): Promise<void> => {
  const exists = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!exists) throw new HttpError(404, 'Product not found');
};

const assertDuplicateNotExists = async (
  productId: string,
  partTypeId: string,
  materialId?: string,
  exceptId?: string,
): Promise<void> => {
  const existing = await prisma.productSpecification.findFirst({
    where: {
      productId,
      partTypeId,
      materialId: materialId ?? null,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw new HttpError(409, 'Specification with same partTypeId/materialId already exists');
  }
};

export const listProductSpecifications = asyncHandler(async (req: Request, res: Response) => {
  const productId = getParamString(req.params.productId, 'productId');
  await ensureProductExists(productId);

  const rows = await prisma.productSpecification.findMany({
    where: { productId },
    orderBy: [{ partTypeId: 'asc' }, { materialId: 'asc' }],
  });

  return res.json(rows.map(mapProductSpecification));
});

export const getProductSpecificationById = asyncHandler(async (req: Request, res: Response) => {
  const productId = getParamString(req.params.productId, 'productId');
  const id = getParamString(req.params.id, 'id');

  const row = await prisma.productSpecification.findFirst({
    where: { id, productId },
  });
  if (!row) throw new HttpError(404, 'Product specification not found');

  return res.json(mapProductSpecification(row));
});

export const createProductSpecification = asyncHandler(async (req: Request, res: Response) => {
  const productId = getParamString(req.params.productId, 'productId');
  const body = createProductSpecificationSchema.parse(req.body);

  await ensureProductExists(productId);
  await assertDuplicateNotExists(productId, body.partTypeId, body.materialId);

  const row = await prisma.productSpecification.create({
    data: {
      productId,
      partTypeId: body.partTypeId,
      materialId: body.materialId,
      displayName: body.displayName,
      isActive: body.isActive,
    },
  });

  return res.status(201).json(mapProductSpecification(row));
});

export const updateProductSpecification = asyncHandler(async (req: Request, res: Response) => {
  const productId = getParamString(req.params.productId, 'productId');
  const id = getParamString(req.params.id, 'id');
  const body = updateProductSpecificationSchema.parse(req.body);

  const existing = await prisma.productSpecification.findFirst({
    where: { id, productId },
  });
  if (!existing) throw new HttpError(404, 'Product specification not found');

  const nextPartTypeId = body.partTypeId ?? existing.partTypeId;
  const nextMaterialId = body.materialId ?? existing.materialId ?? undefined;
  await assertDuplicateNotExists(productId, nextPartTypeId, nextMaterialId, id);

  const row = await prisma.productSpecification.update({
    where: { id },
    data: body,
  });

  return res.json(mapProductSpecification(row));
});

export const deleteProductSpecification = asyncHandler(async (req: Request, res: Response) => {
  const productId = getParamString(req.params.productId, 'productId');
  const id = getParamString(req.params.id, 'id');

  const existing = await prisma.productSpecification.findFirst({
    where: { id, productId },
    select: { id: true },
  });
  if (!existing) throw new HttpError(404, 'Product specification not found');

  await prisma.productSpecification.delete({ where: { id } });
  return res.status(204).send();
});
