// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-DOMAIN-MODELS-001 — тип детали / техописание
export interface PartType {
  _id?: string;
  name: string;
  /** Техописание / параметры для сопоставления с ТЗ */
  description?: string;
  isActive?: boolean;
}
