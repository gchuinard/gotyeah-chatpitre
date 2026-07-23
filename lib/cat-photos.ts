/// Règles de l'espace Photos.
///
/// Sans dépendance : ce fichier est lu par des composants client, qui doivent
/// annoncer le délai au propriétaire, et par la tâche planifiée qui efface.
/// Les deux doivent parler du même nombre de jours, sans quoi on annoncerait
/// une durée et on en appliquerait une autre.

/// Nombre de jours pendant lesquels une photo reste disponible.
///
/// Passé ce délai, le fichier est RÉELLEMENT effacé du disque, pas seulement
/// masqué. C'est ce qui a rendu l'ordonnanceur nécessaire : un filtre calculé
/// aurait fait de la promesse un mensonge.
export const PHOTO_RETENTION_DAYS = 30;

/// Poids maximal d'une photo. Distinct de la limite des documents : une photo
/// de téléphone pèse plus lourd qu'un carnet de vaccination scanné, et c'est
/// le disque du Pi qui encaisse.
export const PHOTO_MAX_MB = 8;

/// Formats acceptés. Pas de PDF ici, contrairement aux documents : une photo
/// de séjour est une image, et accepter un PDF donnerait une vignette vide.
export const PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export type PhotoMimeType = (typeof PHOTO_MIME_TYPES)[number];

export function isPhotoMimeType(mime: string): mime is PhotoMimeType {
  return (PHOTO_MIME_TYPES as readonly string[]).includes(mime);
}

const PHOTO_EXTENSION: Record<PhotoMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heic",
};

export function photoExtension(mime: PhotoMimeType): string {
  return PHOTO_EXTENSION[mime];
}

/// Date avant laquelle une photo doit être effacée.
///
/// `now` est passé en argument : une fonction qui lit l'horloge n'est pas
/// vérifiable, et le rendu d'un composant doit rester pur.
export function photoExpiryBefore(now: Date): Date {
  return new Date(now.getTime() - PHOTO_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

/// Nombre de jours restants avant effacement, jamais négatif.
export function photoDaysLeft(createdAt: Date, now: Date): number {
  const elapsed = (now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000);
  return Math.max(0, Math.ceil(PHOTO_RETENTION_DAYS - elapsed));
}
