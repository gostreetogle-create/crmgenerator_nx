// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-DOMAIN-MODELS-001 — заказ/производство: snapshot строк (будущий BL поток)
export interface OrderStatus {
  key: string;
  name: string;
}

export interface OrderLineMount {
  mountTypeId: string;
  mountTypeName: string;
}

export interface OrderLineFunctionality {
  functionalityId: string;
  functionalityName: string;
}

export interface OrderLineProductSnapshot {
  productName: string;
  productSku?: string;

  categoryId?: string;
  categoryName?: string;

  partTypeId?: string;
  partTypeName?: string;

  materialId?: string;
  materialName?: string;

  productNotes?: string;
  productIsActive?: boolean;
}

export interface OrderLine {
  _id?: string;
  lineNo: number;

  productionCode: string;
  isCustom: boolean;

  // Для производства: что именно и сколько создаём (без цены).
  quantity?: number;
  unit?: string;

  sourceProposalItemLineNo: number;

  productSnapshot: OrderLineProductSnapshot;
  mounts: OrderLineMount[];
  functionalities: OrderLineFunctionality[];
}

export interface Order {
  _id?: string;
  number: string;

  status: OrderStatus;
  clientId?: string;
  organizationId?: string;

  createdAt?: string;
  updatedAt?: string;

  // Трассировка от КП
  sourceProposalId?: string;
  sourceProposalVersionId?: string;

  lines?: OrderLine[];
}

