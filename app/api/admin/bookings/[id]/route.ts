import type { NextRequest } from "next/server";
import type {
  BookingStatus,
  ExtraUnit,
  NotificationType,
  Prisma as PrismaTypes,
} from "@prisma/client";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  handle,
  HttpError,
  isBookingArchivable,
  isBookingClosed,
  json,
  parseJson,
  requireAdmin,
} from "@/lib/api";
import { adminBookingUpdateSchema } from "@/lib/validations";
import { extraLineTotal } from "@/lib/pricing";
import { createNotification } from "@/lib/notifications";
import { differenceInCalendarDays } from "date-fns";

type RouteContext = { params: Promise<{ id: string }> };

// Notification envoyée au client selon le nouveau statut. Les statuts absents
// de cette table (PENDING, CANCELLED) ne déclenchent pas de notif.
const STATUS_NOTIFICATION: Partial<
  Record<BookingStatus, { type: NotificationType; title: string; body?: string }>
> = {
  COMPLETED: {
    type: "BOOKING_COMPLETED",
    title: "Votre séjour est terminé",
    body: "Retrouvez sa facture et le carnet de séjour de votre chat.",
  },
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
///
/// Les `extras` sont remplacés intégralement : si l'array est fourni, les
/// lignes BookingExtra existantes sont supprimées et celles passées sont
/// recréées dans la foulée (transaction).
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const admin = await requireAdmin();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        cats: { select: { catId: true } },
        extras: true,
      },
    });
    if (!booking) throw new HttpError(404, "Réservation introuvable.");

    const data = await parseJson(req, adminBookingUpdateSchema);

    // Réouverture : sortie anticipée AVANT la garde de lecture seule, pour que
    // celle-ci conserve sa règle simple (aucune écriture ordinaire sur un
    // séjour clôturé) et que l'exception reste unique et nommée. Surtout, ne
    // pas fondre cette branche dans le flux principal : elle y traverserait le
    // recalcul du devis, l'annulation en cascade des rendez-vous et la table
    // des notifications, et annoncerait au client « demande acceptée » à
    // chaque réouverture.
    if (data.reopen) {
      if (!isBookingClosed(booking.status)) {
        throw new HttpError(
          409,
          "Ce séjour n'est pas clôturé, il n'y a rien à rouvrir.",
        );
      }
      const reopened = await prisma.booking.update({
        where: { id },
        // Un séjour TERMINÉ a forcément été accepté, il y retourne. Un séjour
        // ANNULÉ repart en attente : rien en base ne dit s'il avait été
        // accepté, et le total ne le prouve pas puisque le devis se saisit
        // avant l'acceptation. Repasser par une acceptation explicite est peu
        // coûteux et renotifie correctement le client.
        data: {
          status: booking.status === "COMPLETED" ? "ACCEPTED" : "PENDING",
          closedAt: null,
        },
      });
      return json({ booking: reopened });
    }

    // Séjour clôturé : lecture seule, en miroir de ce que la fiche admin
    // affiche. Un séjour ANNULÉ est totalement figé ; sur un séjour TERMINÉ on
    // laisse passer le seul encaissement, le solde pouvant être réglé après le
    // départ des chats. Sans cette garde, « Poser une question » écrivait un
    // message ET rouvrait le séjour en « Question posée », alors que le bouton
    // « Envoyer » voisin était refusé.
    if (isBookingClosed(booking.status)) {
      const touched = Object.entries(data)
        .filter(([, value]) => value !== undefined)
        .map(([key]) => key);
      const paymentOnly =
        booking.status === "COMPLETED" &&
        touched.length > 0 &&
        touched.every((key) => key === "paidAmount");
      if (!paymentOnly) {
        throw new HttpError(
          409,
          "Ce séjour est clôturé, il est en lecture seule.",
        );
      }
    }

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

    const nights = differenceInCalendarDays(booking.endDate, booking.startDate);

    // Suppléments finaux : ceux fournis si présents, sinon les existants. Le
    // total de chaque ligne est dérivé de l'unité × prix unitaire (× nuits /
    // quantité). Les demandes client encore non chiffrées valent null
    // (« à chiffrer ») — comptées comme 0 tant que l'admin ne les pose pas.
    const finalExtras: {
      label: string;
      unit: ExtraUnit;
      unitAmount: Prisma.Decimal | null;
      quantity: number;
      amount: Prisma.Decimal | null;
    }[] =
      data.extras !== undefined
        ? data.extras.map((e) => ({
            label: e.label,
            unit: e.unit,
            unitAmount: new Prisma.Decimal(e.unitAmount),
            quantity: e.quantity,
            amount: extraLineTotal(e.unit, e.unitAmount, e.quantity, nights),
          }))
        : booking.extras.map((e) => ({
            label: e.label,
            unit: e.unit,
            unitAmount: e.unitAmount,
            quantity: e.quantity,
            amount: e.amount,
          }));
    const extrasTotal = finalExtras.reduce(
      (sum, e) => sum.plus(e.amount ?? 0),
      new Prisma.Decimal(0),
    );

    // Si on a les deux tarifs unitaires, on recalcule total + acompte.
    let totalAmount = booking.totalAmount;
    let depositAmount = booking.depositAmount;
    if (pricePerFirstCat !== null && pricePerExtraCat !== null) {
      const extras = Math.max(0, booking.cats.length - 1);
      const perNight = pricePerFirstCat.plus(pricePerExtraCat.times(extras));
      const nightsTotal = perNight.times(nights);
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
    // Refuse d'accepter tant qu'une ligne demandée par le client n'est pas
    // chiffrée (montant null) — l'admin doit confirmer chaque supplément.
    if (data.status === "ACCEPTED" && finalExtras.some((e) => e.amount === null)) {
      throw new HttpError(
        400,
        "Chiffrez tous les suppléments demandés avant d'accepter la demande.",
      );
    }

    // Un séjour ne se termine que depuis « accepté ». Sans cette garde, un
    // appel direct pourrait clore une demande jamais acceptée, qui deviendrait
    // alors définitivement en lecture seule.
    if (data.status === "COMPLETED" && booking.status !== "ACCEPTED") {
      throw new HttpError(
        409,
        "Seul un séjour accepté peut être marqué comme terminé.",
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
      paidAmount:
        data.paidAmount !== undefined ? new Prisma.Decimal(data.paidAmount) : undefined,
      // `undefined` et NON `null` quand le statut n'est pas touché. Écrire
      // `null` ici effacerait la date de clôture à chaque enregistrement
      // d'encaissement sur un séjour terminé, seule écriture que la garde
      // ci-dessus laisse passer : le séjour ressortirait alors définitivement
      // de l'archive, des semaines plus tard, à cause d'une action sans
      // rapport. Introuvable en recette.
      closedAt:
        data.status === undefined
          ? undefined
          : isBookingArchivable(data.status)
            ? new Date()
            : null,
    };

    // Update booking + remplace les extras + poste la question éventuelle,
    // le tout dans une transaction.
    const updated = await prisma.$transaction(async (tx) => {
      if (data.extras !== undefined) {
        await tx.bookingExtra.deleteMany({ where: { bookingId: id } });
        if (data.extras.length > 0) {
          await tx.bookingExtra.createMany({
            data: data.extras.map((e, idx) => ({
              bookingId: id,
              label: e.label,
              unit: e.unit,
              unitAmount: new Prisma.Decimal(e.unitAmount),
              quantity: e.quantity,
              amount: extraLineTotal(e.unit, e.unitAmount, e.quantity, nights),
              sortOrder: idx * 10,
            })),
          });
        }
      }
      // Question au client : on poste le message dans le fil (vu par le
      // client comme un message de la maison).
      if (data.questionMessage) {
        await tx.bookingMessage.create({
          data: {
            bookingId: id,
            authorId: admin.id,
            isFromAdmin: true,
            content: data.questionMessage,
          },
        });
      }
      // Clôturer un séjour emporte ses télé-rendez-vous : sinon le créneau
      // resterait « planifié », que le client pourrait rejoindre alors que la
      // fiche verrouillée ne le permet plus côté pension.
      if (data.status && isBookingClosed(data.status)) {
        await tx.appointment.updateMany({
          where: { bookingId: id, status: "SCHEDULED" },
          data: { status: "CANCELLED" },
        });
      }
      return tx.booking.update({ where: { id }, data: updateData });
    });

    // Notification au client. Une question l'emporte sur la notif de statut
    // générique (évite de notifier deux fois pour un même geste).
    if (data.questionMessage) {
      await createNotification({
        userId: booking.userId,
        type: "BOOKING_QUESTION",
        title: "La pension vous a posé une question",
        link: `/dashboard/bookings/${booking.id}`,
      });
    } else if (data.status && data.status !== booking.status) {
      const notif = STATUS_NOTIFICATION[data.status];
      if (notif) {
        await createNotification({
          userId: booking.userId,
          type: notif.type,
          title: notif.title,
          body: notif.body,
          link: `/dashboard/bookings/${booking.id}`,
        });
      }
    }

    return json({ booking: updated });
  });
}
