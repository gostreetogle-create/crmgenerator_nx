// Eve-BE: API-MAP-001 — маппинг Prisma → JSON (`_id`, плоские DTO для фронта)
import type {
  Category,
  Client,
  Material,
  Organization,
  PartType,
  Product,
} from '@prisma/client';

const undef = undefined;

export function mapOrganization(row: Organization) {
  return {
    _id: row.id,
    name: row.name,
    fullName: row.fullName ?? undef,
    shortName: row.shortName ?? undef,
    inn: row.inn ?? undef,
    kpp: row.kpp ?? undef,
    ogrn: row.ogrn ?? undef,
    okpo: row.okpo ?? undef,
    okved: row.okved ?? undef,
    legalAddress: row.legalAddress ?? undef,
    actualAddress: row.actualAddress ?? undef,
    postalAddress: row.postalAddress ?? undef,
    bankName: row.bankName ?? undef,
    bik: row.bik ?? undef,
    settlementAccount: row.settlementAccount ?? undef,
    correspondentAccount: row.correspondentAccount ?? undef,
    phone: row.phone ?? undef,
    extraPhone: row.extraPhone ?? undef,
    email: row.email ?? undef,
    website: row.website ?? undef,
    directorFio: row.directorFio ?? undef,
    directorFioShort: row.directorFioShort ?? undef,
    directorPosition: row.directorPosition ?? undef,
    directorActingOn: row.directorActingOn ?? undef,
    fssNumber: row.fssNumber ?? undef,
    pfrNumber: row.pfrNumber ?? undef,
    logoUrl: row.logoUrl ?? undef,
    signatureUrl: row.signatureUrl ?? undef,
    stampUrl: row.stampUrl ?? undef,
    notes: row.notes ?? undef,
    markup: row.markup ?? undef,
    prefix: row.prefix ?? undef,
    vatPercent: row.vatPercent ?? undef,
    accentColor: row.accentColor ?? undef,
    requisites: row.requisites ?? undef,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapClient(row: Client) {
  return {
    _id: row.id,
    name: row.name,
    inn: row.inn ?? undef,
    kpp: row.kpp ?? undef,
    contactPerson: row.contactPerson ?? undef,
    phone: row.phone ?? undef,
    email: row.email ?? undef,
    requisites: row.requisites ?? undef,
    address: row.address ?? undef,
    notes: row.notes ?? undef,
    discount: row.discount ?? undef,
    clientMarkup: row.clientMarkup ?? undef,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapCategory(row: Category) {
  return {
    _id: row.id,
    name: row.name,
    parentId: row.parentId ?? undef,
    sortOrder: row.sortOrder ?? undef,
    isActive: row.isActive ?? undef,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapMaterial(row: Material) {
  return {
    _id: row.id,
    name: row.name,
    code: row.code ?? undef,
    notes: row.notes ?? undef,
    isActive: row.isActive ?? undef,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapPartType(row: PartType) {
  return {
    _id: row.id,
    name: row.name,
    description: row.description ?? undef,
    isActive: row.isActive ?? undef,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapProduct(row: Product) {
  return {
    _id: row.id,
    name: row.name,
    sku: row.sku ?? undef,
    categoryId: row.categoryId ?? undef,
    partTypeId: row.partTypeId ?? undef,
    materialId: row.materialId ?? undef,
    notes: row.notes ?? undef,
    isActive: row.isActive ?? undef,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

