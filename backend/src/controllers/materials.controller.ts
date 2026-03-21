// Eve-BE: API-CRUD-MATERIAL-001 — CRUD материалов
// Eve-BE: API-VALID-ZOD-002 — zod-схемы
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { mapMaterial } from '../utils/responseMappers';
import { getParamString } from '../utils/getParamString';
import {
  asOptionalBoolean,
  asOptionalString,
  pickCellValue,
  readExcelRows,
} from '../utils/excelImport';

const createMaterialSchema = z
  .object({
    name: z.string().min(1),
    code: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateMaterialSchema = createMaterialSchema.partial().strict();

export const listMaterials = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.material.findMany({ orderBy: { name: 'asc' } });
  return res.json(rows.map(mapMaterial));
});

export const getMaterialById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  const row = await prisma.material.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'Material not found');
  return res.json(mapMaterial(row));
});

export const createMaterial = asyncHandler(async (req: Request, res: Response) => {
  const body = createMaterialSchema.parse(req.body);
  const row = await prisma.material.create({ data: body });
  return res.status(201).json(mapMaterial(row));
});

export const updateMaterial = asyncHandler(async (req: Request, res: Response) => {
  const body = updateMaterialSchema.parse(req.body);
  const id = getParamString(req.params.id, 'id');
  try {
    const row = await prisma.material.update({
      where: { id },
      data: body,
    });
    return res.json(mapMaterial(row));
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'Material not found');
    throw err;
  }
});

export const deleteMaterial = asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = getParamString(req.params.id, 'id');
    await prisma.material.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'Material not found');
    throw err;
  }
});

export const importMaterialsFromExcel = asyncHandler(async (req: Request, res: Response) => {
  const rows = readExcelRows(req.file, ['Материалы', 'Materials']);
  if (!rows.length) {
    throw new HttpError(400, 'Excel sheet has no data rows');
  }

  const errors: Array<{ row: number; message: string }> = [];
  let created = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const payload = {
      name: asOptionalString(pickCellValue(row, ['name', 'название', 'materialName'])),
      code: asOptionalString(pickCellValue(row, ['code', 'код', 'артикул'])),
      notes: asOptionalString(pickCellValue(row, ['notes', 'note', 'заметки', 'описание'])),
      isActive: asOptionalBoolean(pickCellValue(row, ['isActive', 'active', 'активен'])),
    };

    const parsed = createMaterialSchema.safeParse(payload);
    if (!parsed.success) {
      errors.push({
        row: i + 2,
        message: parsed.error.issues.map((issue) => issue.message).join('; '),
      });
      continue;
    }

    await prisma.material.create({ data: parsed.data });
    created += 1;
  }

  return res.json({
    created,
    failed: errors.length,
    errors,
  });
});

