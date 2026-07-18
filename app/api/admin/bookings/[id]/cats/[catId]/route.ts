import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  assertBookingWritable,
  handle,
  HttpError,
  json,
  parseJson,
  requireAdmin,
} from "@/lib/api";
import { catReviewSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";
import { CAT_REVIEW_LABEL } from "@/lib/cat-review";

type RouteContext = { params: Promise<{ id: string; catId: string }> };

/// PATCH /api/admin/bookings/[id]/cats/[catId] — pose ou met à jour l'avis de
/// l'admin sur un chat pour ce séjour (état + note libre). Visible du client,
/// qui est notifié dès qu'un avis (autre que « à évaluer ») est posé.
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    await requireAdmin();
    const { id, catId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!booking) throw new HttpError(404, "Séjour introuvable.");
    assertBookingWritable(booking.status);

    const data = await parseJson(req, catReviewSchema);

    try {
      const link = await prisma.bookingCat.update({
        where: { bookingId_catId: { bookingId: id, catId } },
        data: {
          reviewStatus: data.reviewStatus,
          reviewNote: data.reviewNote ? data.reviewNote : null,
        },
        include: {
          booking: { select: { userId: true } },
          cat: { select: { name: true } },
        },
      });

      // Notifie le client dès qu'un avis concret est posé (pas « à évaluer »).
      if (data.reviewStatus !== "PENDING") {
        await createNotification({
          userId: link.booking.userId,
          type: "CAT_REVIEWED",
          title: `${link.cat.name} : ${CAT_REVIEW_LABEL[data.reviewStatus]}`,
          body: data.reviewNote || undefined,
          link: `/dashboard/bookings/${id}`,
        });
      }

      return json({ link });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new HttpError(404, "Chat introuvable pour ce séjour.");
      }
      throw err;
    }
  });
}
