// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-DOMAIN-MODELS-001 — товар и связи со справочниками
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
  /** Мультивыбор функциональностей (ids из справочника Functionality). */
  functionalityIds?: string[];
  /** Мультивыбор видов монтажа (ids из справочника MountType). */
  mountTypeIds?: string[];
  notes?: string;
  isActive?: boolean;
}
