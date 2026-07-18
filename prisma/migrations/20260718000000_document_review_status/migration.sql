-- Contrôle des documents par la maison : un document reste en attente tant
-- qu'il n'a pas été regardé, puis il est accepté ou refusé (statut visible
-- du client sur la fiche du chat).

-- CreateEnum
CREATE TYPE "DocumentReviewStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "CatDocument" ADD COLUMN     "reviewStatus" "DocumentReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "reviewedAt" TIMESTAMP(3);
