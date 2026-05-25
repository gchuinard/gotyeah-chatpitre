-- AlterTable : les tarifs et l'acompte deviennent nullable. Une demande
-- de réservation nait sans tarif ; la maison pose le devis en validant.
ALTER TABLE "Booking"
  ALTER COLUMN "pricePerFirstCat" DROP NOT NULL,
  ALTER COLUMN "pricePerExtraCat" DROP NOT NULL,
  ALTER COLUMN "totalAmount" DROP NOT NULL,
  ALTER COLUMN "depositAmount" DROP NOT NULL;

-- AlterTable : ajout des suppléments (conditions particulières chiffrées
-- par l'admin lors du devis : nourriture spéciale, soins, visite véto…).
ALTER TABLE "Booking"
  ADD COLUMN "extraNotes" TEXT,
  ADD COLUMN "extraAmount" DECIMAL(10,2);
