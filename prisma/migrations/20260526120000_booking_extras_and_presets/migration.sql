-- Passage des suppléments d'un couple (extraNotes, extraAmount) sur Booking
-- vers une vraie table relationnelle BookingExtra (1-N). Ajoute aussi le
-- catalogue de presets ExtraPreset, éditable côté admin.

-- 1. Nouvelle table : ligne de supplément posée sur un devis.
CREATE TABLE "BookingExtra" (
  "id"        TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "label"     TEXT NOT NULL,
  "amount"    DECIMAL(10,2) NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BookingExtra_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BookingExtra_bookingId_fkey" FOREIGN KEY ("bookingId")
    REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "BookingExtra_bookingId_idx" ON "BookingExtra"("bookingId");

-- 2. Nouvelle table : catalogue éditable des presets.
CREATE TABLE "ExtraPreset" (
  "id"            TEXT NOT NULL,
  "label"         TEXT NOT NULL,
  "defaultAmount" DECIMAL(10,2) NOT NULL,
  "sortOrder"     INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ExtraPreset_pkey" PRIMARY KEY ("id")
);

-- 3. Data-migration : on recopie chaque (extraNotes, extraAmount) non-null
-- vers une ligne BookingExtra. Le label legacy reste comme libellé brut.
-- L'id est généré par gen_random_uuid() (extension pgcrypto disponible par
-- défaut sur PostgreSQL 13+).
INSERT INTO "BookingExtra" ("id", "bookingId", "label", "amount", "sortOrder", "createdAt")
SELECT
  gen_random_uuid()::TEXT,
  "id",
  COALESCE(NULLIF(TRIM("extraNotes"), ''), 'Supplément'),
  "extraAmount",
  0,
  "createdAt"
FROM "Booking"
WHERE "extraAmount" IS NOT NULL AND "extraAmount" > 0;

-- 4. Drop des colonnes legacy.
ALTER TABLE "Booking"
  DROP COLUMN "extraNotes",
  DROP COLUMN "extraAmount";
