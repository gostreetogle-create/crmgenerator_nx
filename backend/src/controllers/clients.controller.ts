// Eve-BE: API-CRUD-CLIENT-001 — CRUD клиентов (list/get/create/update/delete)
// Eve-BE: API-VALID-ZOD-002 — zod-схемы create/update
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { mapClient } from '../utils/responseMappers';
import { getParamString } from '../utils/getParamString';

const createClientSchema = z
  .object({
    name: z.string().min(1),
    inn: z.string().optional(),
    kpp: z.string().optional(),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    requisites: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    discount: z.number().optional(),
    clientMarkup: z.number().optional(),
  })
  .strict();

const updateClientSchema = createClientSchema.partial().strict();

export const listClients = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.client.findMany({ orderBy: { name: 'asc' } });
  return res.json(rows.map(mapClient));
});

export const getClientById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  const row = await prisma.client.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'Client not found');
  return res.json(mapClient(row));
});

export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const body = createClientSchema.parse(req.body);
  const row = await prisma.client.create({ data: body });
  return res.status(201).json(mapClient(row));
});

export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const body = updateClientSchema.parse(req.body);
  const id = getParamString(req.params.id, 'id');
  try {
    const row = await prisma.client.update({
      where: { id },
      data: body,
    });
    return res.json(mapClient(row));
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'Client not found');
    throw err;
  }
});

export const deleteClient = asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = getParamString(req.params.id, 'id');
    await prisma.client.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') throw new HttpError(404, 'Client not found');
    throw err;
  }
});

