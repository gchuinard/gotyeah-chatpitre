-- Signal « modification en cours » : horodatage posé pendant l'édition d'une
-- demande par le client, remis à null à l'enregistrement ou à l'abandon.

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "editingStartedAt" TIMESTAMP(3);
