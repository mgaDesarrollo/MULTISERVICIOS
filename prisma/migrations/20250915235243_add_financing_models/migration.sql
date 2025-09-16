/*
  Warnings:

  - Added the required column `financedAmount` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."SaleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."InstallmentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'CARD', 'MP', 'STRIPE', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Sale" ADD COLUMN     "appliedRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "downPayment" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "financedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "installmentCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "public"."SaleStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "interest" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(12,2);

-- Backfill financedAmount for any pre-existing sales
UPDATE "public"."Sale"
SET "financedAmount" = COALESCE("subtotal", 0) - COALESCE("downPayment", 0)
WHERE "financedAmount" = 0;

-- CreateTable
CREATE TABLE "public"."Installment" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "principalDue" DECIMAL(12,2) NOT NULL,
    "interestDue" DECIMAL(12,2) NOT NULL,
    "feeDue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDue" DECIMAL(12,2) NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "status" "public"."InstallmentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "installmentId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL DEFAULT 'CASH',
    "reference" TEXT,
    "notes" TEXT,
    "appliedPrincipal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "appliedInterest" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "appliedFees" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Installment_dueDate_idx" ON "public"."Installment"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Installment_saleId_number_key" ON "public"."Installment"("saleId", "number");

-- AddForeignKey
ALTER TABLE "public"."Installment" ADD CONSTRAINT "Installment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "public"."Installment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
