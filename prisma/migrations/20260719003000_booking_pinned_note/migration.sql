-- Note attachée à l'épingle : ce qu'il reste à faire sur le séjour.
--
-- Colonne nullable sans valeur par défaut : les séjours déjà épinglés restent
-- épinglés, simplement sans mot, ce qui est exactement leur état actuel. Aucune
-- reprise de données n'est donc nécessaire.
ALTER TABLE "Booking" ADD COLUMN "pinnedNote" TEXT;
