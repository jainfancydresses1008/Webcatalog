-- CreateTable
CREATE TABLE "Dress" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DressSize" (
    "id" SERIAL NOT NULL,
    "size" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "dressId" INTEGER NOT NULL,

    CONSTRAINT "DressSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DressImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "dressId" INTEGER NOT NULL,

    CONSTRAINT "DressImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dress_category_idx" ON "Dress"("category");

-- CreateIndex
CREATE INDEX "Dress_characterName_idx" ON "Dress"("characterName");

-- CreateIndex
CREATE INDEX "DressSize_dressId_idx" ON "DressSize"("dressId");

-- CreateIndex
CREATE INDEX "DressImage_dressId_idx" ON "DressImage"("dressId");

-- AddForeignKey
ALTER TABLE "DressSize" ADD CONSTRAINT "DressSize_dressId_fkey" FOREIGN KEY ("dressId") REFERENCES "Dress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DressImage" ADD CONSTRAINT "DressImage_dressId_fkey" FOREIGN KEY ("dressId") REFERENCES "Dress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
