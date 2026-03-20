// Eve-arch: 000 — без выделенного паттерна
export interface Organization {
  _id?: string;
  name: string;
  fullName?: string;
  shortName?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  okpo?: string;
  okved?: string;
  legalAddress?: string;
  actualAddress?: string;
  postalAddress?: string;
  bankName?: string;
  bik?: string;
  settlementAccount?: string;
  correspondentAccount?: string;
  phone?: string;
  extraPhone?: string;
  email?: string;
  website?: string;
  directorFio?: string;
  directorFioShort?: string;
  directorPosition?: string;
  directorActingOn?: string;
  fssNumber?: string;
  pfrNumber?: string;
  logoUrl?: string;
  signatureUrl?: string;
  stampUrl?: string;
  notes?: string;
  markup?: number;
  prefix?: string;
  vatPercent?: number;
  /** Цвет акцента для КП/PDF (hex), например `#1d4ed8` */
  accentColor?: string;
  requisites?: string;
  createdAt?: string;
  updatedAt?: string;
}
