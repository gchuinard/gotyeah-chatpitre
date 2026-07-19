import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  assertBookingWritable,
  handle,
  HttpError,
  json,
  parseJson,
  requireUser,
} from "@/lib/api";
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

    assertBookingWritable(booking.status);

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
        // L'onglet est OBLIGATOIRE dans le lien : le fil d'échanges vit dans
        // « Contact client », et l'URL nue ouvre « Administratif ». Sans lui, la
        // notification mènerait à une page où le message qui l'a déclenchée
        // n'apparaît pas.
        link: `/admin/bookings/${booking.id}?onglet=contact`,
      });
    }

    return json({ message }, 201);
  });
}
