/*
  Warnings:

  - You are about to drop the column `topDealsPrice` on the `Product` table. All the data in the column will be lost.
  - Added the required column `VenteflashPrice` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "topDealsPrice",
ADD COLUMN     "VenteflashPrice" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "Product_mainCategory_subCategory_idx" ON "Product"("mainCategory", "subCategory");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");
