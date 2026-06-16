import { NextResponse, type NextRequest } from "next/server";

import { apiError, handle, HttpError, json, requireUser } from "@/lib/api";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { DOCUMENT_TYPE_LABEL, extensionForMime } from "@/lib/cat-documents";
import { prisma } from "@/lib/db";
import { formatISODate } from "@/lib/format";
import { getCatDocumentFor } from "@/lib/repository";
import { deleteDocument, readDocument } from "@/lib/storage";

// Serving + suppression d'un document. fs → runtime nodejs.
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

// GET — voir (inline) ou télécharger (?download=1). Données de santé : auth +
// ownership AVANT de lire le disque, Cache-Control private no-store.
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return apiError("Authentification requise.", 401);
  const doc = await getCatDocumentFor(id, user.id, isAdmin(user));
  if (!doc) return apiError("Document introuvable.", 404);

  let bytes: Buffer;
  try {
    bytes = await readDocument(doc.storageKey);
  } catch {
    return apiError("Fichier introuvable.", 404);
  }

  // Nom « à notre sauce », calculé au serve (reste juste si le chat est renommé).
  const label =
    doc.type === "OTHER" && doc.customLabel ? doc.customLabel : DOCUMENT_TYPE_LABEL[doc.type];
  const displayName = `${doc.cat.name} — ${label} — ${formatISODate(
    doc.documentDate ?? doc.createdAt,
  )}.${extensionForMime(doc.mimeType)}`;
  const download = req.nextUrl.searchParams.get("download") === "1";
  // filename* (RFC 5987) : encode l'UTF-8 et neutralise toute injection via le
  // nom du chat (texte libre).
  const disposition = `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(
    displayName,
  )}`;

  return new NextResponse(bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": disposition,
      "Cache-Control": "private, no-store",
    },
  });
}

// DELETE — propriétaire OU admin. Retire la ligne + le fichier, et nettoie le
// portrait du chat s'il pointait ce document.
export function DELETE(_req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const { id } = await params;
    const user = await requireUser();
    const doc = await getCatDocumentFor(id, user.id, isAdmin(user));
    if (!doc) throw new HttpError(404, "Document introuvable.");

    await prisma.catDocument.delete({ where: { id: doc.id } });
    await deleteDocument(doc.storageKey);

    if (doc.cat.photoUrl === `/api/documents/${doc.id}`) {
      await prisma.cat.update({ where: { id: doc.catId }, data: { photoUrl: null } });
    }

    return json({ ok: true });
  });
}
