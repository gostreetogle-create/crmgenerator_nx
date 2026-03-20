import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { getParamString } from '../utils/getParamString';

const setProductMountsSchema = z
  .object({
    mountTypeIds: z.array(z.string()).default([]),
  })
  .strict();

const setProductFunctionalitiesSchema = z
  .object({
    functionalityIds: z.array(z.string()).default([]),
  })
  .strict();

export const listProductMountTypes = asyncHandler(async (req: Request, res: Response) => {
  const productId = getParamString(req.params.id, 'id');
  const rows = await prisma.productMount.findMany({
    where: { productId },
    select: { mountTypeId: true },
  });
  return res.json({ productId, mountTypeIds: rows.map((r) => r.mountTypeId) });
});

export const setProductMountTypes = asyncHandler(async (req: Request, res: Response) => {
  const productId = getParamString(req.params.id, 'id');
  const body = setProductMountsSchema.parse(req.body);

  await prisma.productMount.deleteMany({ where: { productId } });
  await Promise.all(
    body.mountTypeIds.map((mountTypeId) =>
      prisma.productMount.create({ data: { productId, mountTypeId } }),
    ),
  );

  return res.json({ productId, mountTypeIds: body.mountTypeIds });
});

export const listProductFunctionalities = asyncHandler(async (req: Request, res: Response) => {
  const productId = getParamString(req.params.id, 'id');
  const rows = await prisma.productFunctionality.findMany({
    where: { productId },
    select: { functionalityId: true },
  });
  return res.json({ productId, functionalityIds: rows.map((r) => r.functionalityId) });
});

export const setProductFunctionalities = asyncHandler(async (req: Request, res: Response) => {
  const productId = getParamString(req.params.id, 'id');
  const body = setProductFunctionalitiesSchema.parse(req.body);

  await prisma.productFunctionality.deleteMany({ where: { productId } });
  await Promise.all(
    body.functionalityIds.map((functionalityId) =>
      prisma.productFunctionality.create({ data: { productId, functionalityId } }),
    ),
  );

  return res.json({ productId, functionalityIds: body.functionalityIds });
});

