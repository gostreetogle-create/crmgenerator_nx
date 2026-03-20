-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "shortName" TEXT,
    "inn" TEXT,
    "kpp" TEXT,
    "ogrn" TEXT,
    "okpo" TEXT,
    "okved" TEXT,
    "legalAddress" TEXT,
    "actualAddress" TEXT,
    "postalAddress" TEXT,
    "bankName" TEXT,
    "bik" TEXT,
    "settlementAccount" TEXT,
    "correspondentAccount" TEXT,
    "phone" TEXT,
    "extraPhone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "directorFio" TEXT,
    "directorFioShort" TEXT,
    "directorPosition" TEXT,
    "directorActingOn" TEXT,
    "fssNumber" TEXT,
    "pfrNumber" TEXT,
    "logoUrl" TEXT,
    "signatureUrl" TEXT,
    "stampUrl" TEXT,
    "notes" TEXT,
    "markup" DOUBLE PRECISION,
    "prefix" TEXT,
    "vatPercent" DOUBLE PRECISION,
    "accentColor" TEXT,
    "requisites" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "inn" TEXT,
    "kpp" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "requisites" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "discount" DOUBLE PRECISION,
    "clientMarkup" DOUBLE PRECISION,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER,
    "isActive" BOOLEAN,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartType" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN,

    CONSTRAINT "PartType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "categoryId" TEXT,
    "partTypeId" TEXT,
    "materialId" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");
