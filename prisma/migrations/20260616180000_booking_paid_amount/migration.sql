-- Montant réellement encaissé sur un séjour (saisi par l'admin), distinct du
-- total facturé. NULL = rien d'encaissé enregistré.
ALTER TABLE "Booking" ADD COLUMN "paidAmount" DECIMAL(10,2);
