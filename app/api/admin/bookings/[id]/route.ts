import type { NextRequest } from "next/server";
import type { BookingStatus, NotificationType, Prisma as PrismaTypes } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { handle, HttpError, json, parseJson, requireAdmin } from "@/lib/api";
import { adminBookingUpdateSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";
import { differenceInCalendarDays } from "date-fns";

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

/// PATCH /api/admin/bookings/[id] — met à jour le statut, les notes admin et/ou
/// le devis (tarifs et suppléments) d'une réservation. totalAmount et
/// depositAmount sont recalculés serveur — jamais saisis par le client.
/// Refuse de passer à ACCEPTED sans tarif valide.
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { cats: { select: { catId: true } } },
    });
    if (!booking) throw new HttpError(404, "Réservation introuvable.");

    const data = await parseJson(req, adminBookingUpdateSchema);

    // État final du devis = valeur fournie ∪ valeur existante.
    const pricePerFirstCat =
      data.pricePerFirstCat !== undefined
        ? new Prisma.Decimal(data.pricePerFirstCat)
        : booking.pricePerFirstCat;
    const pricePerExtraCat =
      data.pricePerExtraCat !== undefined
        ? new Prisma.Decimal(data.pricePerExtraCat)
        : booking.pricePerExtraCat;
    const depositPercentage =
      data.depositPercentage ?? booking.depositPercentage;
    const extraAmount =
      data.extraAmount !== undefined
        ? new Prisma.Decimal(data.extraAmount)
        : booking.extraAmount;
    const extraNotes =
      data.extraNotes !== undefined ? data.extraNotes || null : booking.extraNotes;

    // Si on a les deux tarifs unitaires, on recalcule total + acompte.
    let totalAmount = booking.totalAmount;
    let depositAmount = booking.depositAmount;
    if (pricePerFirstCat !== null && pricePerExtraCat !== null) {
      const nights = differenceInCalendarDays(booking.endDate, booking.startDate);
      const extras = Math.max(0, booking.cats.length - 1);
      const perNight = pricePerFirstCat.plus(pricePerExtraCat.times(extras));
      const nightsTotal = perNight.times(nights);
      const extrasTotal = extraAmount ?? new Prisma.Decimal(0);
      totalAmount = nightsTotal.plus(extrasTotal).toDecimalPlaces(2);
      depositAmount = totalAmount
        .times(depositPercentage)
        .dividedBy(100)
        .toDecimalPlaces(2);
    }

    // Refuse le passage à ACCEPTED sans devis valide.
    if (data.status === "ACCEPTED" && totalAmount === null) {
      throw new HttpError(
        400,
        "Saisissez un tarif avant d'accepter la demande.",
      );
    }

    const updateData: PrismaTypes.BookingUpdateInput = {
      status: data.status,
      adminNotes: data.adminNotes,
      pricePerFirstCat,
      pricePerExtraCat,
      depositPercentage,
      totalAmount,
      depositAmount,
      extraNotes,
      extraAmount,
    };

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    // Notifie le client si le statut a effectivement changé.
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
