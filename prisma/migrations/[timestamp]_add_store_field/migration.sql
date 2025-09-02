-- AlterTable
ALTER TABLE "Product" ADD COLUMN "store" TEXT,
ADD COLUMN "articleRougePrice" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Product_store_idx" ON "Product"("store"); 