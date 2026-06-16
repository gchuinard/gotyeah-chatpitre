import type { NextRequest } from "next/server";

import { handle, HttpError, json, requireUser } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { resolveMimeType } from "@/lib/cat-documents";
import { prisma } from "@/lib/db";
import { getCatFor } from "@/lib/repository";
import { deleteDocument, makeStorageKey, maxUploadBytes, writeDocument } from "@/lib/storage";
import { documentUploadMetaSchema } from "@/lib/validations";

// Upload d'un document sur un chat (fiche chat OU visio). Réservé au
// propriétaire du chat et à l'admin. fs/crypto → runtime nodejs.
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function field(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export function POST(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const { id: catId } = await params;
    const user = await requireUser();
    const cat = await getCatFor(catId, user.id, isAdmin(user));
    if (!cat) throw new HttpError(404, "Chat introuvable.");

    const form = await req.formData();

    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new HttpError(400, "Aucun fichier reçu.");
    }
    const maxBytes = maxUploadBytes();
    if (file.size > maxBytes) {
      throw new HttpError(413, `Fichier trop volumineux (max ${Math.floor(maxBytes / 1024 / 1024)} Mo).`);
    }
    const mimeType = resolveMimeType(file.type, file.name);
    if (!mimeType) {
      throw new HttpError(415, "Type de fichier non autorisé (images JPEG/PNG/HEIC ou PDF).");
    }

    // Métadonnées (champs texte du formulaire) — '' normalisé en undefined.
    const meta = documentUploadMetaSchema.parse({
      type: field(form.get("type")),
      customLabel: field(form.get("customLabel")),
      documentDate: field(form.get("documentDate")),
    });

    const bytes = Buffer.from(await file.arrayBuffer());
    const storageKey = makeStorageKey(mimeType);
    await writeDocument(storageKey, bytes);

    try {
      const doc = await prisma.catDocument.create({
        data: {
          catId: cat.id,
          uploadedById: user.id,
          type: meta.type,
          customLabel: meta.type === "OTHER" ? (meta.customLabel ?? null) : null,
          originalName: file.name,
          storageKey,
          mimeType,
          sizeBytes: file.size,
          documentDate: meta.documentDate ?? null,
        },
      });
      return json({ document: { id: doc.id } }, 201);
    } catch (err) {
      // Insert échoué : on retire le fichier orphelin (cohérence FS/DB).
      await deleteDocument(storageKey);
      throw err;
    }
  });
}
