-- Versements encaissés sur un séjour : plusieurs lignes par séjour, chacune
-- avec son montant, son moyen, sa date et une référence facultative.
--
-- `Booking.paidAmount` est CONSERVÉ et devient la somme de ces lignes,
-- recalculée à chaque écriture. Les écrans qui n'ont besoin que du total n'ont
-- ainsi rien à agréger, et rien de ce qui l'utilisait déjà ne casse.
--
-- Purement additif : cette migration ne touche à aucune donnée existante. La
-- reprise des montants déjà saisis vit dans la migration suivante.

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHEQUE', 'TRANSFER', 'OTHER');

-- CreateTable
CREATE TABLE "BookingPayment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'OTHER',
    "paidAt" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingPayment_bookingId_idx" ON "BookingPayment"("bookingId");

-- AddForeignKey
ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
