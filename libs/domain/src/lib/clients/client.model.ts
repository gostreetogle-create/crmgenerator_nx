// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-DOMAIN-MODELS-001 — заказчик: скидка, реквизиты, контакты
export interface Client {
  _id?: string;
  name: string;
  inn?: string;
  kpp?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  requisites?: string;
  address?: string;
  notes?: string;
  discount?: number;
  clientMarkup?: number;
}
