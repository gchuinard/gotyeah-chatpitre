-- Notification envoyée au client quand son séjour passe en TERMINÉ, avec un
-- renvoi vers sa facture et le carnet de séjour.
--
-- Migration séparée de tout usage, comme pour APPOINTMENT_SCHEDULED : PostgreSQL
-- interdit d'utiliser une valeur d'enum dans la transaction qui l'ajoute. Ici on
-- ne fait qu'ajouter la valeur.
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BOOKING_COMPLETED';
