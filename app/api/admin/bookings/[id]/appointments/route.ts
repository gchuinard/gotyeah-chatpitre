import type { NextRequest } from "next/server";

import {
  assertBookingWritable,
  handle,
  HttpError,
  json,
  parseJson,
  requireAdmin,
} from "@/lib/api";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { createNotification } from "@/lib/notifications";
import { appointmentCreateSchema } from "@/lib/validations";

// Planification d'un télé-rendez-vous sur un séjour (admin). Le client (le
// propriétaire du séjour) est notifié et pourra rejoindre l'appel depuis son
// espace.
type RouteContext = { params: Promise<{ id: string }> };

export function POST(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const { id: bookingId } = await params;
    const admin = await requireAdmin();

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new HttpError(404, "Séjour introuvable.");
    assertBookingWritable(booking.status);

    const input = await parseJson(req, appointmentCreateSchema);

    const appointment = await prisma.appointment.create({
      data: {
        clientId: booking.userId,
        bookingId: booking.id,
        createdById: admin.id,
        scheduledAt: input.scheduledAt,
        durationMin: input.durationMin,
        title: input.title ?? null,
        notes: input.notes ?? null,
      },
    });

    await createNotification({
      userId: booking.userId,
      type: "APPOINTMENT_SCHEDULED",
      title: "Télé-rendez-vous planifié",
      body: formatDateTime(appointment.scheduledAt),
      link: `/dashboard/rdv/${appointment.id}`,
    });

    return json({ appointment }, 201);
  });
}
