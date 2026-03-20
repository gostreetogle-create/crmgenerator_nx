// Eve-arch: 000 — без выделенного паттерна
export interface Product {
  _id?: string;
  /** Обязательное в UI при создании */
  name: string;
  /** Код / SKU */
  sku?: string;
  /** Обязательно в UI карточки товара */
  categoryId?: string;
  /**
   * Тип детали / тех. описание (справочник PartType), опционально.
   * Материал на карточке опционален и логически привязан к этому полю.
   */
  partTypeId?: string;
  materialId?: string;
  /** Функциональность товара (MVP: select в UI). */
  functionality?: string;
  /** Тип монтажа (MVP: select в UI). */
  mounting?: string;
  notes?: string;
  isActive?: boolean;
}
