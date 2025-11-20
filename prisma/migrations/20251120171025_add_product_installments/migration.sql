-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "installmentAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "installmentCount" INTEGER NOT NULL DEFAULT 12;
