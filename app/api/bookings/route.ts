import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handle, HttpError, json, parseJson, requireUser } from "@/lib/api";
import { bookingCreateSchema } from "@/lib/validations";
import { notifyAdmins } from "@/lib/notifications";

/// GET /api/bookings — liste les réservations de l'utilisateur courant.
export function GET() {
  return handle(async () => {
    const user = await requireUser();
    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { cats: { include: { cat: true } } },
    });
    return json({ bookings });
  });
}

/// POST /api/bookings — crée une demande de réservation pour 1+ chats.
export function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const data = await parseJson(req, bookingCreateSchema);

    // Tous les chats sélectionnés doivent appartenir à l'utilisateur.
    const cats = await prisma.cat.findMany({
      where: { id: { in: data.catIds }, ownerId: user.id },
      select: { id: true },
    });
    if (cats.length !== data.catIds.length) {
      throw new HttpError(400, "Un ou plusieurs chats sélectionnés sont introuvables.");
    }

    // Pas de tarif à la création : la demande nait en PENDING sans devis.
    // L'admin pose les montants au passage à ACCEPTED via PATCH.
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        startDate: data.startDate,
        endDate: data.endDate,
        clientNotes: data.clientNotes ?? null,
        cats: { create: cats.map((cat) => ({ catId: cat.id })) },
      },
      include: { cats: { include: { cat: true } } },
    });

    // Notifie les administrateurs de la nouvelle demande.
    await notifyAdmins({
      type: "BOOKING_REQUESTED",
      title: "Nouvelle demande de réservation",
      body: `${user.firstName} ${user.lastName} — ${cats.length} chat(s)`,
      link: `/admin/bookings/${booking.id}`,
    });

    return json({ booking }, 201);
  });
}
