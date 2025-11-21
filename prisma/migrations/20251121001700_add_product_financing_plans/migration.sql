-- CreateTable
CREATE TABLE "public"."ProductFinancingPlan" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "installmentCount" INTEGER NOT NULL,
    "installmentAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductFinancingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductFinancingPlan_productId_idx" ON "public"."ProductFinancingPlan"("productId");

-- AddForeignKey
ALTER TABLE "public"."ProductFinancingPlan" ADD CONSTRAINT "ProductFinancingPlan_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
