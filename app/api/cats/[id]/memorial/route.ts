import type { NextRequest } from "next/server";
import { z } from "zod";

import { handle, HttpError, json, parseJson, requireUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

const memorialSchema = z.object({ passedAway: z.boolean() });

/// PATCH /api/cats/[id]/memorial — marque un chat comme disparu, ou revient
/// sur ce marquage.
///
/// Route à part de la mise à jour générale de la fiche : celle-ci passe par un
/// schéma de champs éditables, et ce marquage n'est pas une correction de
/// fiche, c'est un état. Le mélanger aurait permis de le poser par mégarde en
/// modifiant le poids du chat.
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;

    const cat = await prisma.cat.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });
    // Même réponse qu'il n'existe pas ou qu'il appartienne à autrui : ne pas
    // révéler l'existence d'une fiche à quelqu'un qui n'y a pas droit.
    if (!cat || (cat.ownerId !== user.id && !isAdmin(user))) {
      throw new HttpError(404, "Pensionnaire introuvable.");
    }

    const { passedAway } = await parseJson(req, memorialSchema);

    const updated = await prisma.cat.update({
      where: { id: cat.id },
      // La date est posée maintenant, ou effacée. Réversible : une erreur de
      // manipulation, dans un moment pareil, ne doit pas condamner la fiche.
      data: { passedAwayAt: passedAway ? new Date() : null },
      select: { id: true, passedAwayAt: true },
    });

    return json({ cat: updated });
  });
}
