import type { NextRequest } from "next/server";

import { apiError } from "@/lib/api";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readDocument } from "@/lib/storage";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/// GET /api/photos/[id] — sert une photo de séjour.
///
/// Comme les documents, le fichier n'est JAMAIS servi statiquement : il vit
/// sous un nom opaque hors de tout dossier public, et cette route contrôle
/// l'authentification et la propriété AVANT de lire le disque. Une photo du
/// chat de quelqu'un d'autre ne doit pas s'obtenir en devinant une URL.
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) return apiError("Authentification requise.", 401);

  const photo = await prisma.catPhoto.findUnique({
    where: { id },
    select: {
      storageKey: true,
      mimeType: true,
      cat: { select: { ownerId: true } },
    },
  });
  // Même réponse qu'elle n'existe pas ou qu'elle appartienne à autrui : ne pas
  // révéler l'existence d'une photo à quelqu'un qui n'y a pas droit.
  if (!photo || (photo.cat.ownerId !== user.id && !isAdmin(user))) {
    return apiError("Photo introuvable.", 404);
  }

  let bytes: Buffer;
  try {
    bytes = await readDocument(photo.storageKey);
  } catch {
    // Le fichier a disparu du disque alors que sa ligne existe encore : la
    // purge a pu passer entre la lecture de la page et cette requête.
    return apiError("Photo introuvable.", 404);
  }

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": photo.mimeType,
      // private : une photo d'animal de compagnie reste une donnée
      // personnelle, elle ne doit pas dormir dans un cache partagé.
      "Cache-Control": "private, max-age=3600",
    },
  });
}
