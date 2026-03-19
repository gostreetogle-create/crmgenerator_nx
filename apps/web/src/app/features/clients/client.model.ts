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
