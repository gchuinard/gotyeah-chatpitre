import type { NextRequest } from "next/server";

import {
  assertBookingWritable,
  handle,
  HttpError,
  json,
  requireAdmin,
} from "@/lib/api";
import {
  isPhotoMimeType,
  photoExtension,
  PHOTO_MAX_MB,
} from "@/lib/cat-photos";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { writeDocument } from "@/lib/storage";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/// POST /api/admin/bookings/[id]/photos — la pension dépose des photos.
///
/// C'est la PENSION qui dépose et le client qui reçoit, même logique que le
/// carnet de séjour : c'est nous qui donnons des nouvelles pendant le séjour.
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
    if (!booking) throw new HttpError(404, "Séjour introuvable.");
    assertBookingWritable(booking.status);

    const form = await req.formData();
    const catId = String(form.get("catId") ?? "");
    if (!booking.cats.some((c) => c.catId === catId)) {
      throw new HttpError(400, "Ce chat n'est pas concerné par ce séjour.");
    }

    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) throw new HttpError(400, "Aucune photo reçue.");

    const maxBytes = PHOTO_MAX_MB * 1024 * 1024;

    // TOUT est validé avant d'écrire quoi que ce soit. Sans ce premier passage,
    // une photo trop lourde en milieu de lot laisserait les précédentes
    // enregistrées et les suivantes non, sans que l'écran puisse le dire.
    for (const file of files) {
      if (file.size === 0) throw new HttpError(400, "Fichier vide.");
      if (file.size > maxBytes) {
        throw new HttpError(413, `Photo trop lourde, ${PHOTO_MAX_MB} Mo maximum.`);
      }
      if (!isPhotoMimeType(file.type)) {
        throw new HttpError(415, "Format non accepté, images JPEG, PNG, WebP ou HEIC.");
      }
    }

    // Écriture disque d'abord, base ensuite. Dans l'autre sens, un échec
    // d'écriture laisserait une ligne pointant vers un fichier inexistant, que
    // la purge ne saurait pas nettoyer.
    const written: string[] = [];
    try {
      for (const file of files) {
        if (!isPhotoMimeType(file.type)) continue;
        const storageKey = `${randomUUID()}.${photoExtension(file.type)}`;
        await writeDocument(storageKey, Buffer.from(await file.arrayBuffer()));
        written.push(storageKey);
      }

      await prisma.catPhoto.createMany({
        data: written.map((storageKey, i) => ({
          catId,
          bookingId: booking.id,
          uploadedById: admin.id,
          storageKey,
          mimeType: files[i].type,
          sizeBytes: files[i].size,
        })),
      });
    } catch (err) {
      // Les fichiers déjà posés sont retirés : sans ça ils resteraient sur le
      // disque sans aucune ligne pour les désigner, donc introuvables par la
      // purge comme par un humain.
      const { deleteDocument } = await import("@/lib/storage");
      for (const key of written) {
        try {
          await deleteDocument(key);
        } catch {
          // Rien à faire de plus, on remonte l'erreur d'origine.
        }
      }
      throw err;
    }

    // UNE notification, quel que soit le nombre de photos : le client a reçu
    // des nouvelles, pas cinq.
    await createNotification({
      userId: booking.userId,
      type: "MESSAGE_RECEIVED",
      title:
        files.length > 1
          ? `${files.length} nouvelles photos de votre chat`
          : "Une nouvelle photo de votre chat",
      link: `/dashboard/cats/${catId}?onglet=photos`,
    });

    return json({ added: written.length }, 201);
  });
}
