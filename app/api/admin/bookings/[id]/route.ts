import type { NextRequest } from "next/server";
import type { BookingStatus, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { handle, HttpError, json, parseJson, requireAdmin } from "@/lib/api";
import { adminBookingUpdateSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";

type RouteContext = { params: Promise<{ id: string }> };

// Notification envoyée au client selon le nouveau statut. Les statuts absents
// de cette table (PENDING, CANCELLED, COMPLETED) ne déclenchent pas de notif —
// l'énumération NotificationType ne prévoit pas de type dédié.
const STATUS_NOTIFICATION: Partial<
  Record<BookingStatus, { type: NotificationType; title: string }>
> = {
  ACCEPTED: {
    type: "BOOKING_ACCEPTED",
    title: "Votre demande de réservation a été acceptée",
  },
  REJECTED: {
    type: "BOOKING_REJECTED",
    title: "Votre demande de réservation a été refusée",
  },
  QUESTION_ASKED: {
    type: "BOOKING_QUESTION",
    title: "La pension vous a posé une question",
  },
};

/// PATCH /api/admin/bookings/[id] — met à jour le statut et/ou les notes admin
/// d'une réservation (admin uniquement). Notifie le client si le statut change.
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new HttpError(404, "Réservation introuvable.");

    const data = await parseJson(req, adminBookingUpdateSchema);

    // Les champs `undefined` sont ignorés par Prisma (mise à jour partielle).
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: data.status, adminNotes: data.adminNotes },
    });

    // Notifie le client uniquement si le statut a réellement changé.
    if (data.status && data.status !== booking.status) {
      const notif = STATUS_NOTIFICATION[data.status];
      if (notif) {
        await createNotification({
          userId: booking.userId,
          type: notif.type,
          title: notif.title,
          link: `/dashboard/bookings/${booking.id}`,
        });
      }
    }

    return json({ booking: updated });
  });
}
