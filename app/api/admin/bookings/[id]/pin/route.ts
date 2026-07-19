import type { NextRequest } from "next/server";
import { z } from "zod";

import { handle, HttpError, json, parseJson, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

const pinSchema = z.object({ pinned: z.boolean() });

/// PATCH /api/admin/bookings/[id]/pin — épingle ou désépingle un séjour dans la
/// file « À traiter ».
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

    const { pinned } = await parseJson(req, pinSchema);
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { pinnedForAdmin: pinned },
      select: { id: true, pinnedForAdmin: true },
    });

    return json({ booking: updated });
  });
}
