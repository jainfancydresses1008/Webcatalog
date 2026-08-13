-- AlterTable
ALTER TABLE "Dress" ADD COLUMN     "subcategory" TEXT;

-- CreateTable
CREATE TABLE "SiteStats" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "visitorCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dress_subcategory_idx" ON "Dress"("subcategory");

-- CreateIndex
CREATE INDEX "Dress_category_subcategory_idx" ON "Dress"("category", "subcategory");
