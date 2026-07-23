import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  assertBookingWritable,
  handle,
  HttpError,
  json,
  parseJson,
  requireAdmin,
} from "@/lib/api";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

/// Heure « HH:MM », ou chaîne vide pour retirer l'exception et revenir au
/// créneau habituel. Le contrôle est refait ici : `type="time"` n'engage que le
/// navigateur, et la route reste atteignable directement.
const timeField = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$|^$/, "Heure attendue au format HH:MM.");

const scheduleSchema = z.object({
  arrivalTime: timeField,
  departureTime: timeField,
});

/// PATCH /api/admin/bookings/[id]/schedule — pose ou retire l'horaire convenu.
///
/// Route à part du PATCH général, qui porte déjà le devis, le statut et les
/// suppléments : un horaire n'est ni un prix ni une décision, et le mélanger
/// obligerait à rouvrir un schéma déjà lourd.
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!booking) throw new HttpError(404, "Séjour introuvable.");

    // Un séjour clôturé est en lecture seule : convenir d'une heure d'arrivée
    // sur un séjour terminé ou annulé n'a aucun sens.
    assertBookingWritable(booking.status);

    const data = await parseJson(req, scheduleSchema);

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      // La chaîne vide devient null : c'est l'absence d'exception, pas une
      // heure valant « ». Sans cette conversion, l'affichage croirait qu'un
      // horaire a été convenu et annoncerait « à  » au client.
      data: {
        arrivalTime: data.arrivalTime === "" ? null : data.arrivalTime,
        departureTime: data.departureTime === "" ? null : data.departureTime,
      },
      select: { id: true, arrivalTime: true, departureTime: true },
    });

    return json({ booking: updated });
  });
}
