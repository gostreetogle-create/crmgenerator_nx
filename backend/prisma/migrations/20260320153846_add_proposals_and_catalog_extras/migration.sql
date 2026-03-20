-- CreateTable
CREATE TABLE "Status" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MountType" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN,

    CONSTRAINT "MountType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Functionality" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN,

    CONSTRAINT "Functionality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMount" (
    "productId" TEXT NOT NULL,
    "mountTypeId" TEXT NOT NULL,

    CONSTRAINT "ProductMount_pkey" PRIMARY KEY ("productId","mountTypeId")
);

-- CreateTable
CREATE TABLE "ProductFunctionality" (
    "productId" TEXT NOT NULL,
    "functionalityId" TEXT NOT NULL,

    CONSTRAINT "ProductFunctionality_pkey" PRIMARY KEY ("productId","functionalityId")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT,
    "organizationId" TEXT,
    "currentVersionId" TEXT,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "proposalId" TEXT NOT NULL,
    "versionNo" INTEGER NOT NULL,
    "statusId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "ProposalVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalItem" (
    "id" TEXT NOT NULL,
    "proposalVersionId" TEXT NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "productSpecificationId" TEXT,
    "title" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "unitPrice" DOUBLE PRECISION,
    "vatRate" DOUBLE PRECISION,
    "lineTotal" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "ProposalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalItemMount" (
    "proposalItemId" TEXT NOT NULL,
    "mountTypeId" TEXT NOT NULL,

    CONSTRAINT "ProposalItemMount_pkey" PRIMARY KEY ("proposalItemId","mountTypeId")
);

-- CreateTable
CREATE TABLE "ProposalItemFunctionality" (
    "proposalItemId" TEXT NOT NULL,
    "functionalityId" TEXT NOT NULL,

    CONSTRAINT "ProposalItemFunctionality_pkey" PRIMARY KEY ("proposalItemId","functionalityId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Status_key_key" ON "Status"("key");

-- CreateIndex
CREATE INDEX "MountType_name_idx" ON "MountType"("name");

-- CreateIndex
CREATE INDEX "Functionality_name_idx" ON "Functionality"("name");

-- CreateIndex
CREATE INDEX "ProposalVersion_proposalId_versionNo_idx" ON "ProposalVersion"("proposalId", "versionNo");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalVersion_proposalId_versionNo_key" ON "ProposalVersion"("proposalId", "versionNo");

-- CreateIndex
CREATE INDEX "ProposalItem_proposalVersionId_lineNo_idx" ON "ProposalItem"("proposalVersionId", "lineNo");
