-- Épingle de la file « À traiter » : garde un séjour sous les yeux même quand
-- plus rien ne l'y ferait entrer. Additive, avec valeur par défaut, donc sans
-- effet sur les séjours existants.
ALTER TABLE "Booking" ADD COLUMN     "pinnedForAdmin" BOOLEAN NOT NULL DEFAULT false;
