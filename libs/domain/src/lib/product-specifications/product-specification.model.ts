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
