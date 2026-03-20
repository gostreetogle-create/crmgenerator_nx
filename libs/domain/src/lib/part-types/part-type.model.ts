export interface PartType {
  _id?: string;
  name: string;
  /** Техописание / параметры для сопоставления с ТЗ */
  description?: string;
  isActive?: boolean;
}
