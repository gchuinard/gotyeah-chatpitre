import type { NextRequest } from "next/server";
import { z } from "zod";

import { handle, HttpError, json, parseJson, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

type RouteContext = { params: Promise<{ id: string }> };

const stayUpdateSchema = z.object({
  catId: z.string().min(1, "Sélectionnez un chat."),
  content: z.string().trim().min(1, "Le contenu ne peut pas être vide."),
  imageVariant: z
    .enum(["COBALT", "PAPRIKA", "CANARI", "FEUILLE"])
    .optional(),
  imagePose: z
    .enum(["SITTING", "SLEEPING", "STANDING", "WATCHING"])
    .optional(),
});

const VARIANTS = ["COBALT", "PAPRIKA", "CANARI", "FEUILLE"] as const;
const POSES = ["SITTING", "SLEEPING", "STANDING", "WATCHING"] as const;

function pickRandom<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/// POST /api/admin/bookings/[id]/stay-updates — admin poste une entrée du
/// carnet de séjour pour un chat précis d'un booking. La photo réelle n'est
/// pas encore supportée ; on stocke un imageVariant + imagePose pour utiliser
/// une illustration Charley Harper en placeholder.
export function POST(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const admin = await requireAdmin();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, userId: true, cats: { select: { catId: true } } },
    });
    if (!booking) {
      throw new HttpError(404, "Séjour introuvable.");
    }

    const data = await parseJson(req, stayUpdateSchema);

    // Vérifier que le chat appartient bien à la réservation
    if (!booking.cats.some((c) => c.catId === data.catId)) {
      throw new HttpError(400, "Ce chat n'est pas concerné par ce séjour.");
    }

    const update = await prisma.stayUpdate.create({
      data: {
        bookingId: booking.id,
        catId: data.catId,
        authorId: admin.id,
        content: data.content,
        imageVariant: data.imageVariant ?? pickRandom(VARIANTS),
        imagePose: data.imagePose ?? pickRandom(POSES),
      },
    });

    // Notifie le client qu'une nouvelle entrée du carnet est dispo.
    await createNotification({
      userId: booking.userId,
      type: "MESSAGE_RECEIVED",
      title: "Nouvelle note de la maison sur votre séjour",
      link: `/dashboard/bookings/${booking.id}`,
    });

    return json({ update }, 201);
  });
}
