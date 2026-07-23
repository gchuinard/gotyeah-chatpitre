-- Photos d'un chat pendant son séjour.
--
-- Table SÉPARÉE de CatDocument, et c'est le point important : leurs cycles de
-- vie sont opposés. Un carnet de vaccination se conserve, une photo de séjour
-- s'efface au bout de trente jours. Les mélanger aurait obligé chaque lecture à
-- distinguer les deux, et un jour on aurait supprimé un certificat de santé.
--
-- Migration purement additive : nouvelle table, aucune donnée existante
-- touchée, aucune reprise.
--
-- Cascades : une photo n'a de sens ni sans son chat, ni sans son séjour, donc
-- les deux suppriment. L'auteur du dépôt passe à NULL si le compte disparaît,
-- pour que la photo reste visible de son propriétaire.
CREATE TABLE "CatPhoto" (
    "id" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatPhoto_pkey" PRIMARY KEY ("id")
);

-- Clé de stockage unique : deux lignes ne doivent jamais désigner le même
-- fichier, sans quoi purger l'une effacerait le fichier servi par l'autre.
CREATE UNIQUE INDEX "CatPhoto_storageKey_key" ON "CatPhoto"("storageKey");

CREATE INDEX "CatPhoto_catId_idx" ON "CatPhoto"("catId");
CREATE INDEX "CatPhoto_bookingId_idx" ON "CatPhoto"("bookingId");
-- Balayé à chaque passage de la purge des photos anciennes.
CREATE INDEX "CatPhoto_createdAt_idx" ON "CatPhoto"("createdAt");

ALTER TABLE "CatPhoto" ADD CONSTRAINT "CatPhoto_catId_fkey"
    FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatPhoto" ADD CONSTRAINT "CatPhoto_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatPhoto" ADD CONSTRAINT "CatPhoto_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
