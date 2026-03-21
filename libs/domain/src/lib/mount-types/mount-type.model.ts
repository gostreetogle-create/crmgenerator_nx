// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-DOMAIN-MODELS-001 — тип монтажа (справочник для товара)
export interface MountType {
  _id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
}
