// Eve-BE: API-CRUD-ORG-001 — CRUD организаций
// Eve-BE: API-VALID-ZOD-002 — zod-схемы полей организации
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { mapOrganization } from '../utils/responseMappers';
import { getParamString } from '../utils/getParamString';

const createOrganizationSchema = z
  .object({
    name: z.string().min(1),
    fullName: z.string().optional(),
    shortName: z.string().optional(),
    inn: z.string().optional(),
    kpp: z.string().optional(),
    ogrn: z.string().optional(),
    okpo: z.string().optional(),
    okved: z.string().optional(),
    legalAddress: z.string().optional(),
    actualAddress: z.string().optional(),
    postalAddress: z.string().optional(),
    bankName: z.string().optional(),
    bik: z.string().optional(),
    settlementAccount: z.string().optional(),
    correspondentAccount: z.string().optional(),
    phone: z.string().optional(),
    extraPhone: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
    directorFio: z.string().optional(),
    directorFioShort: z.string().optional(),
    directorPosition: z.string().optional(),
    directorActingOn: z.string().optional(),
    fssNumber: z.string().optional(),
    pfrNumber: z.string().optional(),
    logoUrl: z.string().optional(),
    signatureUrl: z.string().optional(),
    stampUrl: z.string().optional(),
    notes: z.string().optional(),
    markup: z.number().optional(),
    prefix: z.string().optional(),
    vatPercent: z.number().optional(),
    accentColor: z.string().optional(),
    requisites: z.string().optional(),
  })
  .strict();

const updateOrganizationSchema = createOrganizationSchema.partial().strict();

export const listOrganizations = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.organization.findMany({ orderBy: { name: 'asc' } });
  return res.json(rows.map(mapOrganization));
});

export const getOrganizationById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  const row = await prisma.organization.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'Organization not found');
  return res.json(mapOrganization(row));
});

export const createOrganization = asyncHandler(async (req: Request, res: Response) => {
  const body = createOrganizationSchema.parse(req.body);
  const row = await prisma.organization.create({ data: body });
  return res.status(201).json(mapOrganization(row));
});

export const updateOrganization = asyncHandler(async (req: Request, res: Response) => {
  const body = updateOrganizationSchema.parse(req.body);

  try {
    const row = await prisma.organization.update({
      where: { id: getParamString(req.params.id, 'id') },
      data: body,
    });
    return res.json(mapOrganization(row));
  } catch (err: any) {
    if (err?.code === 'P2025') {
      throw new HttpError(404, 'Organization not found');
    }
    throw err;
  }
});

export const deleteOrganization = asyncHandler(async (req: Request, res: Response) => {
  try {
    await prisma.organization.delete({
      where: { id: getParamString(req.params.id, 'id') },
    });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') {
      throw new HttpError(404, 'Organization not found');
    }
    throw err;
  }
});

