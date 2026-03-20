// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-DOMAIN-MODELS-001 — материал
export interface Material {
  _id?: string;
  name: string;
  code?: string;
  notes?: string;
  isActive?: boolean;
}
