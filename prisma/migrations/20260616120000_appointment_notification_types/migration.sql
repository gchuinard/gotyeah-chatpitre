-- Nouveaux types de notification pour le télé-rendez-vous (visioconférence).
-- Séparés de la migration qui crée la table Appointment : PostgreSQL interdit
-- d'utiliser une valeur d'enum dans la même transaction que son ajout. Ici on
-- ne fait qu'ajouter les valeurs (aucun usage), comme pour CAT_REVIEWED.
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'APPOINTMENT_SCHEDULED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'APPOINTMENT_CANCELLED';
