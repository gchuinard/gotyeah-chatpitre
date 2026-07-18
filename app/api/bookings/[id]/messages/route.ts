import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handle, HttpError, json, parseJson, requireUser } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { bookingMessageSchema } from "@/lib/validations";
import { createNotification, notifyAdmins } from "@/lib/notifications";

type RouteContext = { params: Promise<{ id: string }> };

/// POST /api/bookings/[id]/messages — poste un message dans le fil d'une
/// réservation. Accessible au propriétaire ou à un administrateur.
export function POST(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });
    const userIsAdmin = isAdmin(user);
    if (!booking || (booking.userId !== user.id && !userIsAdmin)) {
      throw new HttpError(404, "Réservation introuvable.");
    }

    // Séjour clôturé : le fil est en lecture seule des deux côtés. Le verrou
    // vit ici et pas seulement dans l'interface, sinon il ne tient pas.
    // « Refusé » n'en fait volontairement PAS partie : la demande est tranchée
    // mais l'échange continue, c'est ce qu'annonce la confirmation de refus.
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      throw new HttpError(
        409,
        "Ce séjour est clôturé, le fil est en lecture seule.",
      );
    }

    const { content } = await parseJson(req, bookingMessageSchema);

    const message = await prisma.bookingMessage.create({
      data: {
        bookingId: booking.id,
        authorId: user.id,
        isFromAdmin: userIsAdmin,
        content,
      },
    });

    // Notifie l'autre partie : un admin écrit → notif au client ;
    // un client écrit → notif aux admins.
    if (userIsAdmin) {
      await createNotification({
        userId: booking.userId,
        type: "MESSAGE_RECEIVED",
        title: "Nouveau message de la pension",
        link: `/dashboard/bookings/${booking.id}`,
      });
    } else {
      await notifyAdmins({
        type: "MESSAGE_RECEIVED",
        title: "Nouveau message d'un client",
        link: `/admin/bookings/${booking.id}`,
      });
    }

    return json({ message }, 201);
  });
}
