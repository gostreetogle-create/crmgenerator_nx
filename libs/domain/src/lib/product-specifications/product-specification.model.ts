// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-DOMAIN-MODELS-001 — спецификация под КП/матрицу (каркас домена)
/** Вариант товара: тип детали + опционально материал (уникальная пара на товар). */
export interface ProductSpecification {
  _id?: string;
  productId: string;
  /** Опционально: вариант «только тип детали» */
  materialId?: string;
  partTypeId: string;
  /** Подпись в списках / КП (опционально) */
  displayName?: string;
  isActive?: boolean;
}
