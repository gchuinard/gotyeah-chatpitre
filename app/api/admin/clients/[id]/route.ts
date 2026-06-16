import type { NextRequest } from "next/server";

import { handle, HttpError, json, parseJson, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";
import { clientAdminNotesSchema } from "@/lib/validations";

// Met à jour la note interne admin d'un client. Réservé à l'admin.
type RouteContext = { params: Promise<{ id: string }> };

export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const { id } = await params;
    await requireAdmin();

    const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new HttpError(404, "Client introuvable.");

    const input = await parseJson(req, clientAdminNotesSchema);
    await prisma.user.update({ where: { id }, data: { adminNotes: input.adminNotes } });

    return json({ ok: true });
  });
}
