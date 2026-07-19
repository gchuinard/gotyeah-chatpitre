-- Rattrapage des télé-rendez-vous orphelins.
--
-- L'annulation en cascade d'un séjour n'existe que depuis le 2026-07-18 : les
-- créneaux rattachés à un séjour déjà clôturé avant cette date sont restés
-- « planifiés ». Relevé en production : 2 créneaux dans ce cas, sur des séjours
-- annulés. Concrètement, ces clients gardaient un bouton « Rejoindre l'appel »
-- actif pour un appel que la pension ne pouvait plus rejoindre de son côté.
--
-- Fermer la porte dans le code ne suffisait pas : il fallait aussi solder
-- l'existant.
--
-- Rejouable : ne touche que les créneaux encore planifiés d'un séjour clôturé.
UPDATE "Appointment" a
SET "status" = 'CANCELLED'
FROM "Booking" b
WHERE a."bookingId" = b."id"
  AND a."status" = 'SCHEDULED'
  AND b."status" IN ('CANCELLED', 'COMPLETED');
