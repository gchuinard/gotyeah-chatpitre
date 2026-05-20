import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handle, HttpError, json, requireUser } from "@/lib/api";
import { isAdmin } from "@/lib/auth";

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
