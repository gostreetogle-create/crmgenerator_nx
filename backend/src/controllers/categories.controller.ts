// Eve-BE: API-CRUD-CATEGORY-001 — CRUD категорий товаров
// Eve-BE: API-VALID-ZOD-002 — zod-схемы
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { mapCategory } from '../utils/responseMappers';
import { getParamString } from '../utils/getParamString';
import {
  asOptionalBoolean,
  asOptionalInt,
  asOptionalString,
  pickCellValue,
  readExcelRows,
} from '../utils/excelImport';

const createCategorySchema = z
  .object({
    name: z.string().min(1),
    parentId: z.string().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateCategorySchema = createCategorySchema.partial().strict();

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return res.json(rows.map(mapCategory));
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  const row = await prisma.category.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'Category not found');
  return res.json(mapCategory(row));
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const body = createCategorySchema.parse(req.body);
  const row = await prisma.category.create({ data: body });
  return res.status(201).json(mapCategory(row));
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const body = updateCategorySchema.parse(req.body);
  const id = getParamString(req.params.id, 'id');
  try {
    const row = await prisma.category.update({
      where: { id },
      data: body,
    });
    return res.json(mapCategory(row));
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'Category not found');
    throw err;
  }
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = getParamString(req.params.id, 'id');
    await prisma.category.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'Category not found');
    throw err;
  }
});

export const importCategoriesFromExcel = asyncHandler(async (req: Request, res: Response) => {
  const rows = readExcelRows(req.file, ['Категории', 'Categories']);
  if (!rows.length) {
    throw new HttpError(400, 'Excel sheet has no data rows');
  }

  const errors: Array<{ row: number; message: string }> = [];
  let created = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const payload = {
      name: asOptionalString(pickCellValue(row, ['name', 'название', 'categoryName'])),
      parentId: asOptionalString(pickCellValue(row, ['parentId', 'parent', 'родитель', 'родительId'])),
      sortOrder: asOptionalInt(pickCellValue(row, ['sortOrder', 'sort', 'порядок', 'сортировка'])),
      isActive: asOptionalBoolean(pickCellValue(row, ['isActive', 'active', 'активен'])),
    };

    const parsed = createCategorySchema.safeParse(payload);
    if (!parsed.success) {
      errors.push({
        row: i + 2,
        message: parsed.error.issues.map((issue) => issue.message).join('; '),
      });
      continue;
    }

    await prisma.category.create({ data: parsed.data });
    created += 1;
  }

  return res.json({
    created,
    failed: errors.length,
    errors,
  });
});

