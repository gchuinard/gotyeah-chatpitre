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
import { createNotification } from "@/lib/notifications";

type RouteContext = { params: Promise<{ id: string }> };

const stayUpdateSchema = z.object({
  /// Un ou plusieurs chats du séjour : la pension écrit une fois pour tous
  /// ceux qui ont partagé la journée.
  catIds: z.array(z.string().min(1)).min(1, "Sélectionnez au moins un chat."),
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
      select: {
        id: true,
        userId: true,
        status: true,
        cats: { select: { catId: true } },
      },
    });
    if (!booking) {
      throw new HttpError(404, "Séjour introuvable.");
    }
    assertBookingWritable(booking.status);

    const data = await parseJson(req, stayUpdateSchema);

    // Les doublons sont écartés avant tout contrôle : un même chat envoyé deux
    // fois créerait deux entrées identiques dans son carnet.
    const catIds = [...new Set(data.catIds)];

    // Chaque chat doit appartenir à CE séjour. Sans ce contrôle, une requête
    // forgée écrirait dans le carnet du chat d'un autre client.
    const booked = new Set(booking.cats.map((c) => c.catId));
    if (catIds.some((catId) => !booked.has(catId))) {
      throw new HttpError(400, "Ce chat n'est pas concerné par ce séjour.");
    }

    // Une illustration tirée UNE fois pour toute la fournée : les chats qui
    // partagent une note doivent partager son image, sinon la même phrase
    // apparaîtrait sous trois dessins différents.
    const imageVariant = data.imageVariant ?? pickRandom(VARIANTS);
    const imagePose = data.imagePose ?? pickRandom(POSES);

    // Une entrée par chat, dans UNE transaction : soit tous les carnets
    // reçoivent la note, soit aucun. Une écriture partielle laisserait un chat
    // sans nouvelle sans que personne ne s'en aperçoive.
    const updates = await prisma.$transaction(
      catIds.map((catId) =>
        prisma.stayUpdate.create({
          data: {
            bookingId: booking.id,
            catId,
            authorId: admin.id,
            content: data.content,
            imageVariant,
            imagePose,
          },
        }),
      ),
    );

    // UNE notification, même si la note concerne trois chats : le client a reçu
    // une nouvelle, pas trois. En envoyer une par chat transformerait sa cloche
    // en avalanche pour un seul geste de la pension.
    await createNotification({
      userId: booking.userId,
      type: "MESSAGE_RECEIVED",
      title: "Nouvelle note de la maison sur votre séjour",
      // Le carnet vit dans l'onglet « Nouvelles ».
      link: `/dashboard/bookings/${booking.id}?onglet=nouvelles`,
    });

    return json({ updates }, 201);
  });
}
