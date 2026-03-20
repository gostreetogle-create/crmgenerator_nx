// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-DOMAIN-MODELS-001 — категория товара
export interface Category {
  _id?: string;
  /** Обязательное в UI при создании */
  name: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}
