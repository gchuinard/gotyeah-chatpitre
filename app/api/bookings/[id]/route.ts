import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handle, HttpError, json, parseJson, requireUser } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import { bookingUpdateSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

// Une demande n'est modifiable / annulable que tant qu'elle n'est pas traitée.
const EDITABLE_STATUSES = ["PENDING", "QUESTION_ASKED"];

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

// Actions du client sur sa propre demande : l'annuler, ou signaler qu'il est
// en train de la modifier (beginEdit / endEdit) — ce dernier pose un simple
// avertissement « modification en cours » côté admin, sans verrou.
const patchActionSchema = z.object({
  action: z.enum(["cancel", "beginEdit", "endEdit"]),
});

/// PATCH /api/bookings/[id] — actions du client : cancel / beginEdit / endEdit.
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });
    if (!booking || booking.userId !== user.id) {
      throw new HttpError(404, "Réservation introuvable.");
    }

    const { action } = await parseJson(req, patchActionSchema);
    const editable = EDITABLE_STATUSES.includes(booking.status);

    // Signale le début d'une édition : pose l'horodatage « modification en
    // cours » que l'admin voit (dans une fenêtre de fraîcheur).
    if (action === "beginEdit") {
      if (!editable) {
        throw new HttpError(409, "Cette demande ne peut plus être modifiée à ce stade.");
      }
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: { editingStartedAt: new Date() },
      });
      return json({ booking: updated });
    }

    // Fin d'édition (abandon) : retire l'avertissement.
    if (action === "endEdit") {
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: { editingStartedAt: null },
      });
      return json({ booking: updated });
    }

    // action === "cancel"
    if (!editable) {
      throw new HttpError(
        409,
        "Cette réservation ne peut plus être annulée à ce stade.",
      );
    }
    // Annuler un séjour annule les télé-rendez-vous qui lui sont liés : sans
    // ça le créneau resterait « planifié », le client pourrait rejoindre un
    // appel que la pension ne peut plus rejoindre depuis sa fiche verrouillée,
    // et rien dans l'interface ne permet de solder un créneau devenu caduc.
    const updated = await prisma.$transaction(async (tx) => {
      await tx.appointment.updateMany({
        where: { bookingId: booking.id, status: "SCHEDULED" },
        data: { status: "CANCELLED" },
      });
      return tx.booking.update({
        where: { id: booking.id },
        // La date de clôture décide de l'archivage au bout de 30 jours. Elle se
        // pose ici, au moment exact du changement de statut, et nulle part
        // ailleurs : `updatedAt` ne conviendrait pas, il bouge à chaque
        // écriture ultérieure.
        data: { status: "CANCELLED", editingStartedAt: null, closedAt: new Date() },
      });
    });

    // Préviens l'admin pour qu'il ne traite plus la demande.
    await notifyAdmins({
      type: "BOOKING_REJECTED", // pas d'enum CANCELLED — on réutilise le plus proche
      title: "Séjour annulé par le client",
      link: `/admin/bookings/${booking.id}`,
    });

    // Et confirme au client.
    await createNotification({
      userId: user.id,
      type: "BOOKING_REJECTED",
      title: "Votre demande de séjour a été annulée",
      link: `/dashboard/bookings/${booking.id}`,
    });

    return json({ booking: updated });
  });
}

/// PUT /api/bookings/[id] — modification d'une demande par le client tant
/// qu'elle est en attente : dates, pensionnaires, note, entretien. Les
/// suppléments existants sont conservés (non modifiables ici : le modèle ne
/// relie pas une ligne à son preset d'origine).
export function PUT(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });
    if (!booking || booking.userId !== user.id) {
      throw new HttpError(404, "Réservation introuvable.");
    }
    if (!EDITABLE_STATUSES.includes(booking.status)) {
      throw new HttpError(
        409,
        "Cette demande ne peut plus être modifiée à ce stade.",
      );
    }

    const data = await parseJson(req, bookingUpdateSchema);

    // Tous les chats sélectionnés doivent appartenir à l'utilisateur.
    const cats = await prisma.cat.findMany({
      where: { id: { in: data.catIds }, ownerId: user.id },
      select: { id: true },
    });
    if (cats.length !== data.catIds.length) {
      throw new HttpError(400, "Un ou plusieurs chats sélectionnés sont introuvables.");
    }

    const selectedIds = cats.map((cat) => cat.id);
    const updated = await prisma.$transaction(async (tx) => {
      // Met à jour la liste des pensionnaires par différence, sans repartir de
      // zéro : un chat conservé garde l'avis déjà posé par la maison
      // (reviewStatus / reviewNote), y compris en QUESTION_ASKED où l'admin a
      // pu l'évaluer. On retire seulement les désélectionnés et on ajoute
      // seulement les nouveaux.
      await tx.bookingCat.deleteMany({
        where: { bookingId: booking.id, catId: { notIn: selectedIds } },
      });
      const kept = await tx.bookingCat.findMany({
        where: { bookingId: booking.id },
        select: { catId: true },
      });
      const keptIds = new Set(kept.map((k) => k.catId));
      const toAdd = selectedIds.filter((catId) => !keptIds.has(catId));
      if (toAdd.length > 0) {
        await tx.bookingCat.createMany({
          data: toAdd.map((catId) => ({ bookingId: booking.id, catId })),
          skipDuplicates: true,
        });
      }
      return tx.booking.update({
        where: { id: booking.id },
        data: {
          startDate: data.startDate,
          endDate: data.endDate,
          clientNotes: data.clientNotes ?? null,
          interviewRequested: data.interviewRequested ?? false,
          interviewChannel: data.interviewRequested
            ? (data.interviewChannel ?? null)
            : null,
          interviewTopic: data.interviewRequested
            ? (data.interviewTopic ?? null)
            : null,
          editingStartedAt: null,
        },
        include: { cats: { include: { cat: true } } },
      });
    });

    // Préviens l'admin que la demande a changé.
    await notifyAdmins({
      type: "BOOKING_REQUESTED",
      title: "Demande de séjour modifiée",
      body: `${user.firstName} ${user.lastName}, ${cats.length} chat(s)`,
      link: `/admin/bookings/${booking.id}`,
    });

    return json({ booking: updated });
  });
}
