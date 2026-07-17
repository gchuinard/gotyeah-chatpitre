-- Entretien préalable (visio / téléphone) demandé par le client sur une
-- demande de séjour, pour discuter d'un point précis avant l'arrivée.

-- CreateEnum
CREATE TYPE "InterviewChannel" AS ENUM ('VIDEO', 'PHONE');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "interviewRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "interviewChannel" "InterviewChannel",
ADD COLUMN     "interviewTopic" TEXT;
