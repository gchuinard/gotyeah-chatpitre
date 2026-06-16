-- Documents associés à un chat (carnet de vaccination, certificat de santé…).
-- Le fichier vit sur un volume disque sous un nom opaque (storageKey) ; cette
-- table ne porte que la métadonnée. storageKey est UNIQUE (pas de collision).

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('VACCINATION', 'IDENTIFICATION', 'HEALTH_CERTIFICATE', 'ANTIPARASITIC', 'PRESCRIPTION', 'PASSPORT', 'STERILIZATION', 'INSURANCE', 'CARE_AUTHORIZATION', 'DIET', 'PHOTO', 'OTHER');

-- CreateTable
CREATE TABLE "CatDocument" (
    "id" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "type" "DocumentType" NOT NULL,
    "customLabel" TEXT,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "documentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatDocument_storageKey_key" ON "CatDocument"("storageKey");

-- CreateIndex
CREATE INDEX "CatDocument_catId_idx" ON "CatDocument"("catId");

-- CreateIndex
CREATE INDEX "CatDocument_catId_type_idx" ON "CatDocument"("catId", "type");

-- AddForeignKey
ALTER TABLE "CatDocument" ADD CONSTRAINT "CatDocument_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatDocument" ADD CONSTRAINT "CatDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
