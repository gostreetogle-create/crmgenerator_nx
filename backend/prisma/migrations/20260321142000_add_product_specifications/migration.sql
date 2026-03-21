CREATE TABLE IF NOT EXISTS "ProductSpecification" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "productId" TEXT NOT NULL,
  "materialId" TEXT,
  "partTypeId" TEXT NOT NULL,
  "displayName" TEXT,
  "isActive" BOOLEAN,
  CONSTRAINT "ProductSpecification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProductSpecification_productId_idx"
  ON "ProductSpecification"("productId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ProductSpecification_productId_fkey'
  ) THEN
    ALTER TABLE "ProductSpecification"
      ADD CONSTRAINT "ProductSpecification_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;