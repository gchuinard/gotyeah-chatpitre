import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { handle, HttpError, json, parseJson, requireAdmin } from "@/lib/api";
import { catReviewSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string; catId: string }> };

/// PATCH /api/admin/bookings/[id]/cats/[catId] — pose ou met à jour l'avis de
/// l'admin sur un chat pour ce séjour (état + note libre). Visible du client.
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    await requireAdmin();
    const { id, catId } = await params;
    const data = await parseJson(req, catReviewSchema);

    try {
      const link = await prisma.bookingCat.update({
        where: { bookingId_catId: { bookingId: id, catId } },
        data: {
          reviewStatus: data.reviewStatus,
          reviewNote: data.reviewNote ? data.reviewNote : null,
        },
      });
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
