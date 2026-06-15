-- Nouveau type de notification : la maison a posé un avis sur un chat.
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'CAT_REVIEWED';
