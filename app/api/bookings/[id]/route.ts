import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handle, HttpError, json, parseJson, requireUser } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { createNotification, notifyAdmins } from "@/lib/notifications";

type RouteContext = { params: Promise<{ id: string }> };

/// GET /api/bookings/[id] — détail d'une réservation (chats, fil de messages).
/// Accessible au propriétaire de la réservation ou à un administrateur.
export function GET(_req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        cats: { include: { cat: true } },
        messages: { orderBy: { createdAt: "asc" } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // 404 aussi bien si la réservation n'existe pas que si elle appartient à
    // un autre utilisateur (et que le demandeur n'est pas admin).
    if (!booking || (booking.userId !== user.id && !isAdmin(user))) {
      throw new HttpError(404, "Réservation introuvable.");
    }

    return json({ booking });
  });
}

// Le client a un seul levier sur sa propre réservation : l'annuler tant
// qu'elle n'est pas confirmée (PENDING ou QUESTION_ASKED). Tout autre
// changement de statut passe par la route admin.
const cancelSchema = z.object({
  action: z.literal("cancel"),
});

/// PATCH /api/bookings/[id] — actions du client sur sa propre réservation.
/// Pour l'instant, uniquement « cancel » (passage en CANCELLED) tant que
/// le séjour est PENDING ou QUESTION_ASKED.
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });
    if (!booking || booking.userId !== user.id) {
      throw new HttpError(404, "Réservation introuvable.");
    }

    await parseJson(req, cancelSchema);

    if (!["PENDING", "QUESTION_ASKED"].includes(booking.status)) {
      throw new HttpError(
        409,
        "Cette réservation ne peut plus être annulée à ce stade.",
      );
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });

    // Préviens l'admin pour qu'il ne traite plus la demande.
    await notifyAdmins({
      type: "BOOKING_REJECTED", // pas d'enum CANCELLED — on réutilise le plus proche
      title: "Séjour annulé par le client",
      link: `/admin/bookings/${booking.id}`,
    });

    // Et confirme au client.
    await createNotification({
      userId: user.id,
      type: "BOOKING_REJECTED",
      title: "Votre demande de séjour a été annulée",
      link: `/dashboard/bookings/${booking.id}`,
    });

    return json({ booking: updated });
  });
}
