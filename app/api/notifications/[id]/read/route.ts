import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handle, HttpError, json, requireUser } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

/// PATCH /api/notifications/[id]/read — marque une notification comme lue.
export function PATCH(_req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== user.id) {
      throw new HttpError(404, "Notification introuvable.");
    }

    // Idempotent : on conserve la date de lecture initiale si déjà lue.
    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: notification.readAt ?? new Date() },
    });
    return json({ notification: updated });
  });
}
