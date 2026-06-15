-- Permet au client de demander des options à la réservation (brossage,
-- croquette spéciale, demandes libres…). Ces lignes naissent dans
-- BookingExtra avec requestedByClient = true.
--
-- 1. `amount` devient nullable : une demande libre du client n'a pas encore
--    de prix (« à chiffrer »), distinct de 0 qui est un prix valide. L'admin
--    confirme le montant dans le devis.
-- 2. `requestedByClient` trace l'origine de la ligne (client vs admin).

ALTER TABLE "BookingExtra"
  ALTER COLUMN "amount" DROP NOT NULL;

ALTER TABLE "BookingExtra"
  ADD COLUMN "requestedByClient" BOOLEAN NOT NULL DEFAULT false;
