-- Reprise des séjours clôturés AVANT l'introduction de "closedAt".
--
-- Sans elle, ces séjours n'auraient jamais de date de clôture et resteraient
-- éternellement dans la liste de travail : le code considère volontairement
-- qu'une date absente veut dire « pas encore archivé », pour qu'un séjour ne
-- disparaisse jamais de la vue par accident.
--
-- "updatedAt" est une APPROXIMATION assumée, pas la vraie date de clôture. Il a
-- pu bouger après la clôture (saisie d'un encaissement, note interne). L'erreur
-- va donc toujours dans le sens « archivé plus tard que la réalité », ce qui
-- est le bon sens pour cette reprise.
--
-- Rejouable : la clause WHERE ne touche que les lignes encore vides.
UPDATE "Booking"
SET "closedAt" = "updatedAt"
WHERE "closedAt" IS NULL
  AND "status" IN ('CANCELLED', 'COMPLETED', 'REJECTED');
