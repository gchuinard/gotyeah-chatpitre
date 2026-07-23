-- Heure d'arrivée et de départ convenue pour un séjour donné.
--
-- Colonnes NULLABLES et sans valeur par défaut, volontairement : un séjour sans
-- exception suit les créneaux d'accueil de la pension, qui vivent dans Setting.
-- Distinguer « pas d'exception » d'une heure réellement saisie impose donc de
-- pouvoir rester vide.
--
-- Format « HH:MM », sans date ni fuseau : c'est une heure de pendule, la même
-- toute l'année, pas un instant.
--
-- Migration additive, aucune reprise de données : les séjours existants
-- héritent des créneaux par défaut sans être touchés.
ALTER TABLE "Booking" ADD COLUMN "arrivalTime" TEXT;
ALTER TABLE "Booking" ADD COLUMN "departureTime" TEXT;
