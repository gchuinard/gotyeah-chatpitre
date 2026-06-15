-- Avis de l'admin par chat sur un séjour (validé RAS / avec réserve / refusé)
-- + note libre, visible aussi côté client.

CREATE TYPE "CatReviewStatus" AS ENUM ('PENDING', 'OK', 'RESERVE', 'REJECTED');

ALTER TABLE "BookingCat"
  ADD COLUMN "reviewStatus" "CatReviewStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "reviewNote" TEXT;
