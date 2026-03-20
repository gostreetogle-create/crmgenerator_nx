import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { getParamString } from '../utils/getParamString';

const orderIdSchema = z.string().min(1);

function mapStatus(status: { key: string; name: string }) {
  return { key: status.key, name: status.name };
}

export const listOrders = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { status: true },
  });

  return res.json(
    rows.map((o) => ({
      _id: o.id,
      number: o.number,
      status: mapStatus(o.status),
      clientId: o.clientId ?? undefined,
      organizationId: o.organizationId ?? undefined,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })),
  );
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const orderId = getParamString(req.params.id, 'id');
  orderIdSchema.parse(orderId);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      status: true,
      lines: {
        orderBy: { lineNo: 'asc' },
        include: {
          orderLineMounts: true,
          orderLineFunctionalities: true,
        },
      },
    },
  });

  if (!order) throw new HttpError(404, 'Order not found');

  return res.json({
    _id: order.id,
    number: order.number,
    status: mapStatus(order.status),
    clientId: order.clientId ?? undefined,
    organizationId: order.organizationId ?? undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),

    sourceProposalId: order.sourceProposalId,
    sourceProposalVersionId: order.sourceProposalVersionId,

    lines: order.lines.map((l) => ({
      _id: l.id,
      lineNo: l.lineNo,
      productionCode: l.productionCode,
      isCustom: l.isCustom,

      quantity: l.quantity ?? undefined,
      unit: l.unit ?? undefined,

      sourceProposalItemLineNo: l.sourceProposalItemLineNo,

      productSnapshot: {
        productName: l.productName,
        productSku: l.productSku ?? undefined,
        categoryId: l.categoryId ?? undefined,
        categoryName: l.categoryName ?? undefined,
        partTypeId: l.partTypeId ?? undefined,
        partTypeName: l.partTypeName ?? undefined,
        materialId: l.materialId ?? undefined,
        materialName: l.materialName ?? undefined,
        productNotes: l.productNotes ?? undefined,
        productIsActive: l.productIsActive ?? undefined,
      },

      mounts: l.orderLineMounts.map((m) => ({
        mountTypeId: m.mountTypeId,
        mountTypeName: m.mountTypeName,
      })),
      functionalities: l.orderLineFunctionalities.map((f) => ({
        functionalityId: f.functionalityId,
        functionalityName: f.functionalityName,
      })),
    })),
  });
});

