import type { NextRequest } from "next/server";

import { handle, HttpError, json, requireUser } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { isImageMime } from "@/lib/cat-documents";
import { prisma } from "@/lib/db";
import { getCatDocumentFor } from "@/lib/repository";

// Définit ce document (une image) comme portrait du chat (cat.photoUrl pointe
// la route de serving authentifiée). Réservé au propriétaire + admin.
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export function POST(_req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const { id } = await params;
    const user = await requireUser();
    const doc = await getCatDocumentFor(id, user.id, isAdmin(user));
    if (!doc) throw new HttpError(404, "Document introuvable.");
    if (!isImageMime(doc.mimeType)) {
      throw new HttpError(415, "Seule une image peut servir de portrait.");
    }

    await prisma.cat.update({
      where: { id: doc.catId },
      data: { photoUrl: `/api/documents/${doc.id}` },
    });
    return json({ ok: true });
  });
}
