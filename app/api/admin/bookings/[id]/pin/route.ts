import type { NextRequest } from "next/server";
import { z } from "zod";

import { handle, HttpError, json, parseJson, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

/// Même plafond que le champ côté écran. Le contrôle est refait ici parce que
/// `maxLength` sur un textarea n'engage que le navigateur.
const NOTE_MAX = 200;

const pinSchema = z.object({
  pinned: z.boolean(),
  note: z.string().trim().max(NOTE_MAX).optional(),
});

/// PATCH /api/admin/bookings/[id]/pin — épingle ou désépingle un séjour dans la
/// file « À traiter », avec le mot qui dit ce qu'il reste à y faire.
///
/// Volontairement hors du PATCH général : celui-ci refuse toute écriture sur un
/// séjour clôturé, alors qu'épingler doit rester possible. L'épingle n'est pas
/// une modification du séjour, c'est un marque-page de la pension.
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!booking) throw new HttpError(404, "Séjour introuvable.");

    const { pinned, note } = await parseJson(req, pinSchema);
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        pinnedForAdmin: pinned,
        // Désépingler efface le mot. Le garder ferait resurgir une consigne
        // périmée au prochain épinglage, des semaines plus tard, sans que rien
        // ne signale qu'elle est ancienne. Une note vide vaut pas de note.
        // `note` absent du corps veut dire « ne touche pas au mot », pas « vide
        // le mot » : c'est la même distinction null/undefined qui avait déjà
        // effacé une date sur les PATCH partiels.
        pinnedNote: pinned ? (note === undefined ? undefined : note || null) : null,
      },
      select: { id: true, pinnedForAdmin: true, pinnedNote: true },
    });

    return json({ booking: updated });
  });
}
