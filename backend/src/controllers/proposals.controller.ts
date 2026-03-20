import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { HttpError } from '../errors/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { getParamString } from '../utils/getParamString';

const proposalStatusKeySchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9_]+$/i);

const proposalItemSchema = z
  .object({
    lineNo: z.number().int(),
    isCustom: z.boolean().default(false),
    productSpecificationId: z.string().optional(),
    title: z.string().min(1),
    quantity: z.number().optional(),
    unit: z.string().optional(),
    unitPrice: z.number().optional(),
    vatRate: z.number().optional(),
    lineTotal: z.number().optional(),
    notes: z.string().optional(),
    mountTypeIds: z.array(z.string()).optional().default([]),
    functionalityIds: z.array(z.string()).optional().default([]),
  })
  .strict();

const createProposalSchema = z
  .object({
    clientId: z.string().optional(),
    organizationId: z.string().optional(),
    statusKey: proposalStatusKeySchema.optional(),
    items: z.array(proposalItemSchema).default([]),
  })
  .strict();

const updateProposalSchema = createProposalSchema
  .partial()
  .extend({ items: z.array(proposalItemSchema).optional() })
  .strict();

const createVersionSchema = z
  .object({
    statusKey: proposalStatusKeySchema.optional(),
  })
  .strict();

const changeStatusSchema = z
  .object({
    statusKey: proposalStatusKeySchema,
  })
  .strict();

function mapStatus(status: { key: string; name: string }) {
  return { key: status.key, name: status.name };
}

async function generateProposalNumber(): Promise<string> {
  // number хранится как строка фиксированной длины (например "0236"),
  // чтобы лексикографическая сортировка совпадала с числовой.
  const last = await prisma.proposal.findFirst({
    where: { number: { not: null } },
    orderBy: { number: 'desc' },
    select: { number: true },
  });

  const lastInt = last?.number ? Number(last.number) : 0;
  return String(lastInt + 1).padStart(4, '0');
}

async function ensureProposalNumber(proposalId: string): Promise<string> {
  const existing = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { number: true },
  });

  if (existing?.number) return existing.number;

  const next = await generateProposalNumber();
  await prisma.proposal.update({
    where: { id: proposalId },
    data: { number: next },
  });
  return next;
}

export const listProposals = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.proposal.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      currentVersion: {
        include: { status: true },
      },
    },
  });

  return res.json(
    rows.map((p: any) => ({
      _id: p.id,
      clientId: p.clientId ?? undefined,
      organizationId: p.organizationId ?? undefined,
      currentVersion: p.currentVersion
        ? {
            _id: p.currentVersion.id,
            versionNo: p.currentVersion.versionNo,
            status: mapStatus(p.currentVersion.status),
            sentAt: p.currentVersion.sentAt ?? undefined,
            decidedAt: p.currentVersion.decidedAt ?? undefined,
          }
        : undefined,
    })),
  );
});

export const getProposalById = asyncHandler(async (req: Request, res: Response) => {
  const proposalId = getParamString(req.params.id, 'id');

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      currentVersion: {
        include: {
          status: true,
          items: {
            orderBy: { lineNo: 'asc' },
            include: {
              mounts: true,
              functionalities: true,
            },
          },
        },
      },
    },
  });

  if (!proposal) throw new HttpError(404, 'Proposal not found');

  const current = proposal.currentVersion;
  return res.json({
    _id: proposal.id,
    clientId: proposal.clientId ?? undefined,
    organizationId: proposal.organizationId ?? undefined,
    currentVersion: current
      ? {
          _id: current.id,
          versionNo: current.versionNo,
          status: mapStatus(current.status),
          sentAt: current.sentAt ?? undefined,
          decidedAt: current.decidedAt ?? undefined,
          items: current.items.map((it: any) => ({
            _id: it.id,
            lineNo: it.lineNo,
            isCustom: it.isCustom,
            productSpecificationId: it.productSpecificationId ?? undefined,
            title: it.title,
            quantity: it.quantity ?? undefined,
            unit: it.unit ?? undefined,
            unitPrice: it.unitPrice ?? undefined,
            vatRate: it.vatRate ?? undefined,
            lineTotal: it.lineTotal ?? undefined,
            notes: it.notes ?? undefined,
            mountTypeIds: it.mounts.map((m: any) => m.mountTypeId),
            functionalityIds: it.functionalities.map((f: any) => f.functionalityId),
          })),
        }
      : undefined,
  });
});

async function getCurrentVersionOrThrow(proposalId: string) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      currentVersion: { include: { status: true, items: true } },
    },
  });
  if (!proposal) throw new HttpError(404, 'Proposal not found');
  if (!proposal.currentVersion) throw new HttpError(409, 'Proposal has no current version');
  return proposal;
}

export const createProposal = asyncHandler(async (req: Request, res: Response) => {
  const body = createProposalSchema.parse(req.body);
  const statusKey = body.statusKey ?? 'proposal_waiting';

  const status = await prisma.status.findUnique({ where: { key: statusKey } });
  if (!status) throw new HttpError(400, `Unknown statusKey: ${statusKey}`);

  const proposalNumber = await generateProposalNumber();
  const proposal = await prisma.proposal.create({
    data: {
      number: proposalNumber,
      clientId: body.clientId ?? null,
      organizationId: body.organizationId ?? null,
    },
  });

  const version = await prisma.proposalVersion.create({
    data: {
      proposalId: proposal.id,
      versionNo: 1,
      statusId: status.id,
    },
  });

  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { currentVersionId: version.id },
  });

  await prisma.proposalItem.createMany({
    data: body.items.map((it) => ({
      proposalVersionId: version.id,
      lineNo: it.lineNo,
      isCustom: it.isCustom,
      productSpecificationId: it.productSpecificationId ?? null,
      title: it.title,
      quantity: it.quantity ?? null,
      unit: it.unit ?? null,
      unitPrice: it.unitPrice ?? null,
      vatRate: it.vatRate ?? null,
      lineTotal: it.lineTotal ?? null,
      notes: it.notes ?? null,
    })),
  });

  // Создаём join-наборы для mounts/functionalities по одному (createMany без возврата id).
  const createdItems = await prisma.proposalItem.findMany({
    where: { proposalVersionId: version.id },
    select: { id: true, lineNo: true },
  });

  const byLineNo = new Map(createdItems.map((r) => [r.lineNo, r.id]));

  await Promise.all(
    body.items.map(async (it) => {
      const itemId = byLineNo.get(it.lineNo);
      if (!itemId) return;
      await Promise.all([
        prisma.proposalItemMount.createMany({
          data: it.mountTypeIds.map((mountTypeId) => ({ proposalItemId: itemId, mountTypeId })),
        }),
        prisma.proposalItemFunctionality.createMany({
          data: it.functionalityIds.map((functionalityId) => ({
            proposalItemId: itemId,
            functionalityId,
          })),
        }),
      ]);
    }),
  );

  return res.status(201).json({
    _id: proposal.id,
    currentVersionId: version.id,
  });
});

export const updateProposal = asyncHandler(async (req: Request, res: Response) => {
  const proposalId = getParamString(req.params.id, 'id');
  const body = updateProposalSchema.parse(req.body);

  const proposal = await getCurrentVersionOrThrow(proposalId);
  const current = proposal.currentVersion!;
  const currentStatusKey = current.status.key;

  if (currentStatusKey === 'proposal_paid') {
    throw new HttpError(403, 'Editing is forbidden for paid proposal version');
  }

  // Для MVP: заменяем items текущей версии полностью, если items пришли.
  if (body.items) {
    const items = await prisma.proposalItem.findMany({
      where: { proposalVersionId: current.id },
      select: { id: true, lineNo: true },
    });

    const itemIds = items.map((i) => i.id);

    await Promise.all([
      prisma.proposalItemMount.deleteMany({ where: { proposalItemId: { in: itemIds } as any } }),
      prisma.proposalItemFunctionality.deleteMany({
        where: { proposalItemId: { in: itemIds } as any },
      }),
      prisma.proposalItem.deleteMany({ where: { proposalVersionId: current.id } }),
    ]);

    await prisma.proposalItem.createMany({
      data: body.items.map((it) => ({
        proposalVersionId: current.id,
        lineNo: it.lineNo,
        isCustom: it.isCustom,
        productSpecificationId: it.productSpecificationId ?? null,
        title: it.title,
        quantity: it.quantity ?? null,
        unit: it.unit ?? null,
        unitPrice: it.unitPrice ?? null,
        vatRate: it.vatRate ?? null,
        lineTotal: it.lineTotal ?? null,
        notes: it.notes ?? null,
      })),
    });

    const createdItems = await prisma.proposalItem.findMany({
      where: { proposalVersionId: current.id },
      select: { id: true, lineNo: true },
    });
    const byLineNo = new Map(createdItems.map((r) => [r.lineNo, r.id]));

    await Promise.all(
      body.items.map(async (it) => {
        const itemId = byLineNo.get(it.lineNo);
        if (!itemId) return;
        await Promise.all([
          prisma.proposalItemMount.createMany({
            data: it.mountTypeIds.map((mountTypeId) => ({ proposalItemId: itemId, mountTypeId })),
          }),
          prisma.proposalItemFunctionality.createMany({
            data: it.functionalityIds.map((functionalityId) => ({
              proposalItemId: itemId,
              functionalityId,
            })),
          }),
        ]);
      }),
    );
  }

  return res.json({ _id: proposalId, currentVersionId: current.id });
});

export const deleteProposal = asyncHandler(async (req: Request, res: Response) => {
  const proposalId = getParamString(req.params.id, 'id');

  const proposal: any = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      currentVersion: { include: { status: true }, },
      versions: true,
    },
  });

  if (!proposal) throw new HttpError(404, 'Proposal not found');

  // Не удаляем корень, если в истории есть хотя бы одна оплаченная/зафиксированная версия.
  const paidStatus = await prisma.status.findUnique({ where: { key: 'proposal_paid' } });
  if (!paidStatus) throw new HttpError(500, 'Missing status: proposal_paid');

  const hasPaidVersion = await prisma.proposalVersion.findFirst({
    where: { proposalId, statusId: paidStatus.id },
    select: { id: true },
  });

  if (hasPaidVersion) {
    throw new HttpError(403, 'Deleting is forbidden for proposals that contain paid versions');
  }

  const versions = await prisma.proposalVersion.findMany({ where: { proposalId } });
  const allItems = await prisma.proposalItem.findMany({
    where: { proposalVersionId: { in: versions.map((v) => v.id) } },
    select: { id: true },
  });
  const itemIds = allItems.map((i) => i.id);

  await Promise.all([
    prisma.proposalItemMount.deleteMany({ where: { proposalItemId: { in: itemIds } as any } }),
    prisma.proposalItemFunctionality.deleteMany({
      where: { proposalItemId: { in: itemIds } as any },
    }),
    prisma.proposalItem.deleteMany({ where: { proposalVersionId: { in: versions.map((v) => v.id) } } }),
    prisma.proposalVersion.deleteMany({ where: { proposalId } }),
    prisma.proposal.delete({ where: { id: proposalId } }),
  ]);

  return res.status(204).send();
});

export const changeProposalStatus = asyncHandler(async (req: Request, res: Response) => {
  const proposalId = getParamString(req.params.id, 'id');
  const body = changeStatusSchema.parse(req.body);

  const status = await prisma.status.findUnique({ where: { key: body.statusKey } });
  if (!status) throw new HttpError(400, `Unknown statusKey: ${body.statusKey}`);

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      currentVersion: {
        include: {
          status: true,
          items: {
            orderBy: { lineNo: 'asc' },
            include: {
              mounts: true,
              functionalities: true,
            },
          },
        },
      },
    },
  });
  if (!proposal || !proposal.currentVersion) throw new HttpError(404, 'Proposal not found');

  const current = proposal.currentVersion!;
  if (current.status.key === 'proposal_paid' && body.statusKey !== 'proposal_paid') {
    throw new HttpError(403, 'Cannot move paid proposal version back');
  }

  await prisma.proposalVersion.update({
    where: { id: current.id },
    data: { statusId: status.id },
  });

  let orderId: string | undefined;

  // Бизнес-правило: при переводе КП-версии в `proposal_paid` создаём Заказ,
  // а в `OrderLine` фиксируем снимок товара для гарантии.
  if (status.key === 'proposal_paid') {
    const existingOrder = await prisma.order.findFirst({
      where: { sourceProposalVersionId: current.id },
      select: { id: true },
    });

    if (existingOrder) {
      orderId = existingOrder.id;
    } else {
      const proposalNumber = await ensureProposalNumber(proposalId);
      const plannedStatus = await prisma.status.findUnique({ where: { key: 'order_planned' } });
      if (!plannedStatus) throw new HttpError(500, 'Missing statusKey: order_planned');

      const createdOrder = await prisma.order.create({
        data: {
          sourceProposalId: proposalId,
          sourceProposalVersionId: current.id,
          number: `${proposalNumber}-${current.versionNo}`,
          statusId: plannedStatus.id,
          clientId: proposal.clientId ?? null,
          organizationId: proposal.organizationId ?? null,
        },
        select: { id: true },
      });
      orderId = createdOrder.id;

      // Подготовка справочников для “снимка” комплектации/составов.
      const items = current.items;

      const productIds = Array.from(
        new Set(items.map((it: any) => it.productSpecificationId).filter((v: any) => !!v)),
      ) as string[];

      const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
      const productMap = new Map(products.map((p) => [p.id, p]));

      const categoryIds = Array.from(
        new Set(products.map((p) => p.categoryId).filter((v) => !!v)),
      ) as string[];
      const partTypeIds = Array.from(
        new Set(products.map((p) => p.partTypeId).filter((v) => !!v)),
      ) as string[];
      const materialIds = Array.from(
        new Set(products.map((p) => p.materialId).filter((v) => !!v)),
      ) as string[];

      const [categories, partTypes, materials] = await Promise.all([
        categoryIds.length ? prisma.category.findMany({ where: { id: { in: categoryIds } } }) : Promise.resolve([]),
        partTypeIds.length ? prisma.partType.findMany({ where: { id: { in: partTypeIds } } }) : Promise.resolve([]),
        materialIds.length ? prisma.material.findMany({ where: { id: { in: materialIds } } }) : Promise.resolve([]),
      ]);

      const categoryMap = new Map(categories.map((c) => [c.id, c]));
      const partTypeMap = new Map(partTypes.map((pt) => [pt.id, pt]));
      const materialMap = new Map(materials.map((m) => [m.id, m]));

      const mountTypeIds = Array.from(
        new Set(items.flatMap((it: any) => it.mounts.map((m: any) => m.mountTypeId))),
      ) as string[];
      const functionalityIds = Array.from(
        new Set(items.flatMap((it: any) => it.functionalities.map((f: any) => f.functionalityId))),
      ) as string[];

      const [mountTypes, functionalities] = await Promise.all([
        mountTypeIds.length ? prisma.mountType.findMany({ where: { id: { in: mountTypeIds } } }) : Promise.resolve([]),
        functionalityIds.length ? prisma.functionality.findMany({ where: { id: { in: functionalityIds } } }) : Promise.resolve([]),
      ]);

      const mountTypeNameMap = new Map(mountTypes.map((m) => [m.id, m.name]));
      const functionalityNameMap = new Map(functionalities.map((f) => [f.id, f.name]));

      for (const it of items as any[]) {
        if (it.quantity === null || it.quantity === undefined) {
          throw new HttpError(400, 'Missing quantity in proposal item');
        }
        if (!it.unit) {
          throw new HttpError(400, 'Missing unit in proposal item');
        }

        const product = it.productSpecificationId ? productMap.get(it.productSpecificationId) : undefined;

        const category = product?.categoryId ? categoryMap.get(product.categoryId) : undefined;
        const partType = product?.partTypeId ? partTypeMap.get(product.partTypeId) : undefined;
        const material = product?.materialId ? materialMap.get(product.materialId) : undefined;

        const createdLine = await prisma.orderLine.create({
          data: {
            orderId: orderId!,
            lineNo: it.lineNo,

            // Имеем “№КП-номер позиции” на уровне фронта (display),
            // а тут храним сырой код.
            productionCode: `${proposalNumber}-${it.lineNo}`,

            sourceProposalId: proposalId,
            sourceProposalVersionId: current.id,
            sourceProposalItemLineNo: it.lineNo,
            isCustom: it.isCustom ?? false,

            quantity: it.quantity ?? null,
            unit: it.unit ?? null,

            productName: product?.name ?? it.title,
            productSku: product?.sku ?? undefined,

            categoryId: product?.categoryId ?? undefined,
            categoryName: category?.name ?? undefined,
            partTypeId: product?.partTypeId ?? undefined,
            partTypeName: partType?.name ?? undefined,
            materialId: product?.materialId ?? undefined,
            materialName: material?.name ?? undefined,

            productNotes: product?.notes ?? it.notes ?? undefined,
            productIsActive: product?.isActive ?? undefined,
          },
          select: { id: true },
        });

        const lineId = createdLine.id;

        if (it.mounts?.length) {
          await prisma.orderLineMount.createMany({
            data: it.mounts.map((m: any) => {
              const mountTypeName = mountTypeNameMap.get(m.mountTypeId);
              if (!mountTypeName) throw new HttpError(500, `Missing mountType: ${m.mountTypeId}`);
              return {
                orderLineId: lineId,
                mountTypeId: m.mountTypeId,
                mountTypeName,
              };
            }),
          });
        }

        if (it.functionalities?.length) {
          await prisma.orderLineFunctionality.createMany({
            data: it.functionalities.map((f: any) => {
              const functionalityName = functionalityNameMap.get(f.functionalityId);
              if (!functionalityName) throw new HttpError(500, `Missing functionality: ${f.functionalityId}`);
              return {
                orderLineId: lineId,
                functionalityId: f.functionalityId,
                functionalityName,
              };
            }),
          });
        }
      }
    }
  }

  return res.json({
    _id: proposalId,
    versionId: current.id,
    status: { key: status.key, name: status.name },
    orderId,
  });
});

export const createProposalVersion = asyncHandler(async (req: Request, res: Response) => {
  const proposalId = getParamString(req.params.id, 'id');
  const body = createVersionSchema.parse(req.body);

  const proposal: any = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      currentVersion: { include: { status: true, items: true } },
    },
  });
  if (!proposal || !proposal.currentVersion) throw new HttpError(404, 'Proposal not found');

  const current = proposal.currentVersion;

  const targetStatusKey = body.statusKey ?? 'proposal_waiting';
  const targetStatus = await prisma.status.findUnique({ where: { key: targetStatusKey } });
  if (!targetStatus) throw new HttpError(400, `Unknown statusKey: ${targetStatusKey}`);

  const versions = await prisma.proposalVersion.findMany({
    where: { proposalId },
    orderBy: { versionNo: 'desc' },
    take: 1,
  });
  const nextNo = (versions[0]?.versionNo ?? 0) + 1;

  const newVersion = await prisma.proposalVersion.create({
    data: {
      proposalId,
      versionNo: nextNo,
      statusId: targetStatus.id,
    },
  });

  // Копируем items текущей версии
  const currentItems = await prisma.proposalItem.findMany({
    where: { proposalVersionId: current.id },
    orderBy: { lineNo: 'asc' },
  });

  await prisma.proposalItem.createMany({
    data: currentItems.map((it) => ({
      proposalVersionId: newVersion.id,
      lineNo: it.lineNo,
      isCustom: it.isCustom,
      productSpecificationId: it.productSpecificationId,
      title: it.title,
      quantity: it.quantity,
      unit: it.unit,
      unitPrice: it.unitPrice,
      vatRate: it.vatRate,
      lineTotal: it.lineTotal,
      notes: it.notes,
    })),
  });

  const newItems = await prisma.proposalItem.findMany({
    where: { proposalVersionId: newVersion.id },
    select: { id: true, lineNo: true },
  });
  const byLineNo = new Map(newItems.map((r) => [r.lineNo, r.id]));

  // Копируем join-наборы mounts/functionalities
  const currentItemIds = currentItems.map((it) => it.id);

  const currentMounts = await prisma.proposalItemMount.findMany({
    where: { proposalItemId: { in: currentItemIds } },
  });
  const currentFunctionalities = await prisma.proposalItemFunctionality.findMany({
    where: { proposalItemId: { in: currentItemIds } },
  });

  await Promise.all([
    prisma.proposalItemMount.createMany({
      data: currentMounts
        .map((m) => {
          const lineNo = currentItems.find((it) => it.id === m.proposalItemId)?.lineNo;
          if (!lineNo) return null;
          const newItemId = byLineNo.get(lineNo);
          if (!newItemId) return null;
          return { proposalItemId: newItemId, mountTypeId: m.mountTypeId };
        })
        .filter(Boolean) as any,
    }),
    prisma.proposalItemFunctionality.createMany({
      data: currentFunctionalities
        .map((f) => {
          const lineNo = currentItems.find((it) => it.id === f.proposalItemId)?.lineNo;
          if (!lineNo) return null;
          const newItemId = byLineNo.get(lineNo);
          if (!newItemId) return null;
          return { proposalItemId: newItemId, functionalityId: f.functionalityId };
        })
        .filter(Boolean) as any,
    }),
  ]);

  await prisma.proposal.update({
    where: { id: proposalId },
    data: { currentVersionId: newVersion.id },
  });

  return res.status(201).json({
    _id: proposalId,
    currentVersionId: newVersion.id,
    versionNo: newVersion.versionNo,
    status: { key: targetStatus.key, name: targetStatus.name },
  });
});

