import type { DocumentType } from "@prisma/client";

// Domaine des documents de chat : libellés, options du sélecteur, types MIME
// acceptés, taille max et devine-type. Module PUR (aucune dépendance Prisma ni
// process.env) → importable côté client comme côté serveur.

/// Libellés FR des types de documents.
export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  VACCINATION: "Carnet de vaccination",
  IDENTIFICATION: "Identification (puce / I-CAD)",
  HEALTH_CERTIFICATE: "Certificat de santé",
  ANTIPARASITIC: "Antiparasitaire",
  PRESCRIPTION: "Ordonnance / traitement",
  PASSPORT: "Passeport / antirabique",
  STERILIZATION: "Stérilisation",
  INSURANCE: "Assurance",
  CARE_AUTHORIZATION: "Autorisation de soins",
  DIET: "Régime & consignes",
  PHOTO: "Photo",
  OTHER: "Autre",
};

/// Ordre d'affichage / de regroupement.
export const DOCUMENT_TYPE_ORDER: DocumentType[] = [
  "VACCINATION",
  "IDENTIFICATION",
  "HEALTH_CERTIFICATE",
  "ANTIPARASITIC",
  "PRESCRIPTION",
  "PASSPORT",
  "STERILIZATION",
  "INSURANCE",
  "CARE_AUTHORIZATION",
  "DIET",
  "PHOTO",
  "OTHER",
];

/// Options du <select> de type.
export const DOCUMENT_TYPE_OPTIONS = DOCUMENT_TYPE_ORDER.map((value) => ({
  value,
  label: DOCUMENT_TYPE_LABEL[value],
}));

/// Classes Tailwind (badge outline) par type — tons du DA (santé = cobalt,
/// identité = feuille, administratif = paprika, autre = mute).
export const DOCUMENT_TYPE_BADGE: Record<DocumentType, string> = {
  VACCINATION: "border-cp-cobalt text-cp-cobalt",
  IDENTIFICATION: "border-cp-feuille text-cp-feuille",
  HEALTH_CERTIFICATE: "border-cp-cobalt text-cp-cobalt",
  ANTIPARASITIC: "border-cp-cobalt text-cp-cobalt",
  PRESCRIPTION: "border-cp-cobalt text-cp-cobalt",
  PASSPORT: "border-cp-feuille text-cp-feuille",
  STERILIZATION: "border-cp-cobalt text-cp-cobalt",
  INSURANCE: "border-cp-paprika text-cp-paprika",
  CARE_AUTHORIZATION: "border-cp-paprika text-cp-paprika",
  DIET: "border-cp-canari-deep text-cp-ink-soft",
  PHOTO: "border-cp-ink text-cp-ink",
  OTHER: "border-cp-mute text-cp-mute",
};

/// Taille de fichier lisible : « 482 Ko », « 1.4 Mo ».
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

/// Types MIME acceptés (images + PDF).
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

const MIME_EXTENSION: Record<AllowedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/heif": "heic",
  "application/pdf": "pdf",
};

/// Extension de fichier dérivée du type MIME (pour le nom opaque + l'affichage).
export function extensionForMime(mime: string): string {
  return isAllowedMimeType(mime) ? MIME_EXTENSION[mime] : "bin";
}

/// Vrai si le document est une image (vignette possible).
export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

const EXTENSION_MIME: Record<string, AllowedMimeType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
};

/// Résout un type MIME autorisé depuis l'indice du navigateur, avec repli sur
/// l'extension du nom de fichier (utile pour HEIC, dont le MIME envoyé est
/// souvent vide ou incohérent). null si non autorisé.
export function resolveMimeType(typeHint: string, filename: string): AllowedMimeType | null {
  if (isAllowedMimeType(typeHint)) return typeHint;
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  return EXTENSION_MIME[ext] ?? null;
}

/// Taille maximale par défaut d'un document, en Mo. Le serveur peut la
/// surcharger via MAX_UPLOAD_MB ; sert de référence partagée (UI + défaut).
export const MAX_UPLOAD_MB = 20;

/// Devine le type d'un document depuis le nom de fichier (best-effort, pour
/// pré-sélectionner le type — le client confirme). null si rien ne matche.
export function guessTypeFromFilename(filename: string): DocumentType | null {
  const n = filename.toLowerCase();
  if (/vaccin|\brcp\b|carnet/.test(n)) return "VACCINATION";
  if (/icad|tatou|identif|puce/.test(n)) return "IDENTIFICATION";
  if (/passeport|passport|rage|antirab/.test(n)) return "PASSPORT";
  if (/sant[eé]|certificat|health/.test(n)) return "HEALTH_CERTIFICATE";
  if (/antiparasit|vermifug|tique|frontline|fipronil/.test(n)) return "ANTIPARASITIC";
  if (/ordonnance|prescription|traitement/.test(n)) return "PRESCRIPTION";
  if (/st[eé]ril|castrat/.test(n)) return "STERILIZATION";
  if (/assur|mutuelle|insurance/.test(n)) return "INSURANCE";
  if (/autoris|d[eé]charge|soin/.test(n)) return "CARE_AUTHORIZATION";
  if (/r[eé]gime|aliment|croquet|diet/.test(n)) return "DIET";
  if (/photo|img_|\.jpe?g$|\.png$|\.heic$/.test(n)) return "PHOTO";
  return null;
}
