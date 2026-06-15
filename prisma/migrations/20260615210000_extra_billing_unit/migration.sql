-- Ajoute une base de facturation aux suppléments : par jour (× nuits),
-- par visite (× quantité) ou forfait. Le prix devient un prix unitaire ;
-- le total de ligne `amount` est dérivé serveur.

-- 1. Type énuméré de l'unité de facturation.
CREATE TYPE "ExtraUnit" AS ENUM ('PER_DAY', 'PER_VISIT', 'FLAT');

-- 2. Catalogue : unité par défaut (les presets existants restent en forfait).
ALTER TABLE "ExtraPreset"
  ADD COLUMN "unit" "ExtraUnit" NOT NULL DEFAULT 'FLAT';

-- 3. Lignes de devis : unité, prix unitaire et quantité.
--    Pour les lignes existantes, on recopie l'ancien montant total comme
--    prix unitaire (unité forfait, quantité 1) — total inchangé.
ALTER TABLE "BookingExtra"
  ADD COLUMN "unit" "ExtraUnit" NOT NULL DEFAULT 'FLAT',
  ADD COLUMN "unitAmount" DECIMAL(10,2),
  ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1;

UPDATE "BookingExtra" SET "unitAmount" = "amount" WHERE "amount" IS NOT NULL;
