import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { extensionForMime, MAX_UPLOAD_MB } from "@/lib/cat-documents";

// Stockage des documents sur le volume disque (runtime nodejs only). Les
// fichiers vivent sous un nom OPAQUE dans UPLOAD_DIR ; ils ne sont JAMAIS servis
// statiquement — uniquement via une route authentifiée. Mono-instance (volume
// local au conteneur app). Aucune écriture ne touche /app (perdu au rebuild).

const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR ?? "./.uploads");

/// Taille maximale autorisée par fichier, en octets (env MAX_UPLOAD_MB sinon défaut).
export function maxUploadBytes(): number {
  const mb = Number(process.env.MAX_UPLOAD_MB) || MAX_UPLOAD_MB;
  return mb * 1024 * 1024;
}

/// Génère une clé de stockage opaque (non devinable) avec l'extension du MIME.
export function makeStorageKey(mimeType: string): string {
  return `${randomUUID()}.${extensionForMime(mimeType)}`;
}

/// Écrit un fichier sous sa clé opaque (crée le répertoire si besoin).
export async function writeDocument(storageKey: string, bytes: Buffer): Promise<void> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(resolveKey(storageKey), bytes);
}

/// Lit un document par sa clé opaque.
export function readDocument(storageKey: string): Promise<Buffer> {
  return readFile(resolveKey(storageKey));
}

/// Supprime un document (tolère l'absence du fichier — idempotent).
export async function deleteDocument(storageKey: string): Promise<void> {
  try {
    await unlink(resolveKey(storageKey));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}

/// Résout le chemin absolu d'une clé en garantissant qu'elle reste un fichier
/// direct de UPLOAD_DIR (anti path-traversal : nos clés sont des `uuid.ext`,
/// ceinture + bretelles si jamais une clé corrompue arrivait).
function resolveKey(storageKey: string): string {
  const full = resolve(UPLOAD_DIR, storageKey);
  if (dirname(full) !== UPLOAD_DIR) {
    throw new Error("Clé de stockage invalide.");
  }
  return full;
}
