import { handle, HttpError, json, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

/// PATCH /api/admin/bookings/[id]/messages/read — marque comme lus les messages
/// du CLIENT sur ce séjour.
///
/// Appelée par la fiche séjour au moment où elle s'affiche réellement, et non
/// pendant le rendu serveur : Next précharge les liens, et un marquage fait au
/// rendu aurait vidé la file « À traiter » au simple survol d'une ligne, sans
/// que personne n'ait rien lu.
///
/// Seuls les messages du client sont concernés : ceux de la pension ne doivent
/// jamais faire remonter un séjour dans sa propre file.
export function PATCH(_req: Request, { params }: RouteContext) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!booking) throw new HttpError(404, "Séjour introuvable.");

    const result = await prisma.bookingMessage.updateMany({
      where: { bookingId: booking.id, isFromAdmin: false, readAt: null },
      data: { readAt: new Date() },
    });

    return json({ marked: result.count });
  });
}
