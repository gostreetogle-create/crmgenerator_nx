// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-DOMAIN-MODELS-001 — функциональность (справочник для товара)
export interface Functionality {
  _id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
}
