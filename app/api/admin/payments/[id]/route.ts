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

/// Charge le versement ET le statut de son séjour, en refusant l'accès si le
/// séjour n'accepte plus d'encaissement. Le contrôle porte sur le SÉJOUR, pas
/// sur le versement : c'est l'état du séjour qui décide.
async function loadWritablePayment(paymentId: string) {
  const payment = await prisma.bookingPayment.findUnique({
    where: { id: paymentId },
    select: { id: true, bookingId: true, booking: { select: { status: true } } },
  });
  if (!payment) throw new HttpError(404, "Versement introuvable.");
  assertPaymentWritable(payment.booking.status);
  return payment;
}

/// PATCH /api/admin/payments/[id] — corrige un versement saisi par erreur.
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;
    const payment = await loadWritablePayment(id);

    const data = await parseJson(req, bookingPaymentSchema);

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.bookingPayment.update({
        where: { id: payment.id },
        data: {
          amount: new Prisma.Decimal(data.amount),
          method: data.method,
          paidAt: data.paidAt,
          reference: data.reference ? data.reference : null,
        },
      });
      await syncBookingPaidAmount(tx, payment.bookingId);
      return result;
    });

    return json({ payment: updated });
  });
}

/// DELETE /api/admin/payments/[id] — retire un versement saisi par erreur.
export function DELETE(_req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;
    const payment = await loadWritablePayment(id);

    await prisma.$transaction(async (tx) => {
      await tx.bookingPayment.delete({ where: { id: payment.id } });
      await syncBookingPaidAmount(tx, payment.bookingId);
    });

    return json({ ok: true });
  });
}
