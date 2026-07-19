import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import {
  assertPaymentWritable,
  handle,
  HttpError,
  json,
  parseJson,
  requireAdmin,
} from "@/lib/api";
import { prisma } from "@/lib/db";
import { syncBookingPaidAmount } from "@/lib/repository";
import { bookingPaymentSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

/// POST /api/admin/bookings/[id]/payments — enregistre un versement encaissé
/// sur un séjour (montant, moyen, date, référence facultative).
///
/// `Booking.paidAmount` est recalculé dans la même transaction : c'est un cache
/// de la somme des versements, il ne doit jamais diverger.
export function POST(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const admin = await requireAdmin();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!booking) throw new HttpError(404, "Séjour introuvable.");
    assertPaymentWritable(booking.status);

    const data = await parseJson(req, bookingPaymentSchema);

    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.bookingPayment.create({
        data: {
          bookingId: booking.id,
          amount: new Prisma.Decimal(data.amount),
          method: data.method,
          paidAt: data.paidAt,
          reference: data.reference ? data.reference : null,
          recordedById: admin.id,
        },
      });
      await syncBookingPaidAmount(tx, booking.id);
      return created;
    });

    return json({ payment }, 201);
  });
}
