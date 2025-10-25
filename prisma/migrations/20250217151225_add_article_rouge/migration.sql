-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isArticleRouge" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Product_isArticleRouge_idx" ON "Product"("isArticleRouge");
