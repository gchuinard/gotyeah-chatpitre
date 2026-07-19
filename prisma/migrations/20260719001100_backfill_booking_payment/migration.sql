-- Reprise des encaissements saisis AVANT la table des versements.
--
-- C'est la première migration du projet qui DÉPLACE de la donnée. Chaque
-- "paidAmount" non nul devient une ligne de versement, pour qu'aucun montant
-- déjà encaissé ne disparaisse de l'écran le jour du déploiement.
--
-- Ce qu'on ne sait pas, on ne l'invente pas :
--   * le moyen de paiement est inconnu, donc 'OTHER' ;
--   * la date du versement est inconnue, donc la date de clôture du séjour à
--     défaut de sa dernière modification, ce qui reste une approximation ;
--   * l'auteur de la saisie est inconnu, donc NULL.
-- La référence porte cette provenance en clair, pour qu'on ne prenne pas ces
-- lignes pour des saisies réelles en relisant la comptabilité.
--
-- "paidAmount" n'est PAS remis à zéro : il reste la somme des versements, et
-- après cette reprise il l'est déjà, par construction.
--
-- Les montants nuls sont ignorés : un encaissement à zéro veut dire « rien
-- reçu », pas « un versement de zéro euro ».
--
-- Rejouable : la clause NOT EXISTS empêche de dupliquer une reprise déjà faite.
INSERT INTO "BookingPayment" (
    "id", "bookingId", "amount", "method", "paidAt", "reference", "recordedById", "createdAt"
)
SELECT
    'reprise_' || b."id",
    b."id",
    b."paidAmount",
    'OTHER',
    COALESCE(b."closedAt", b."updatedAt"),
    'Reprise automatique : moyen et date d''origine inconnus',
    NULL,
    now()
FROM "Booking" b
WHERE b."paidAmount" IS NOT NULL
  AND b."paidAmount" > 0
  AND NOT EXISTS (
      SELECT 1 FROM "BookingPayment" p WHERE p."bookingId" = b."id"
  );
