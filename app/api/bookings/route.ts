import type { NextRequest } from "next/server";
import { differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/db";
import { handle, HttpError, json, parseJson, requireUser } from "@/lib/api";
import { bookingCreateSchema } from "@/lib/validations";
import { extraLineTotal } from "@/lib/pricing";
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

    // Options demandées par le client. Les presets sont résolus depuis le
    // catalogue (label + prix indicatif = snapshot) ; le client n'envoie
    // jamais de montant. Les demandes libres naissent sans prix (« à
    // chiffrer ») : l'admin confirmera le montant dans le devis.
    const presetIds = data.extraPresetIds ?? [];
    const presets = presetIds.length
      ? await prisma.extraPreset.findMany({
          where: { id: { in: presetIds } },
          orderBy: { sortOrder: "asc" },
        })
      : [];
    const customExtras = data.customExtras ?? [];
    const nights = differenceInCalendarDays(data.endDate, data.startDate);

    const extraRows = [
      // Presets : on snapshot l'unité + le prix unitaire, quantité 1, et on
      // pré-calcule le total indicatif (× nuits pour les « par jour »).
      ...presets.map((p, idx) => ({
        label: p.label,
        unit: p.unit,
        unitAmount: p.defaultAmount,
        quantity: 1,
        amount: extraLineTotal(p.unit, p.defaultAmount, 1, nights),
        requestedByClient: true,
        sortOrder: idx * 10,
      })),
      // Demandes libres : forfait, non chiffré (l'admin posera le prix).
      ...customExtras.map((label, idx) => ({
        label,
        unit: "FLAT" as const,
        unitAmount: null,
        quantity: 1,
        amount: null,
        requestedByClient: true,
        sortOrder: (presets.length + idx) * 10,
      })),
    ];

    // Pas de tarif à la création : la demande nait en PENDING sans devis.
    // L'admin pose les montants au passage à ACCEPTED via PATCH. Les options
    // du client pré-remplissent le devis admin (snapshot dans BookingExtra).
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
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
        cats: { create: cats.map((cat) => ({ catId: cat.id })) },
        ...(extraRows.length > 0 ? { extras: { create: extraRows } } : {}),
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
