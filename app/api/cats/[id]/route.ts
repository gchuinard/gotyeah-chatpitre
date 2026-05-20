import type { NextRequest } from "next/server";
import type { Cat } from "@prisma/client";
import { prisma } from "@/lib/db";
import { handle, HttpError, json, parseJson, requireUser } from "@/lib/api";
import { catUpdateSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

/// Récupère un chat en vérifiant qu'il appartient bien à l'utilisateur.
/// Renvoie 404 aussi bien s'il n'existe pas que s'il appartient à autrui
/// (on ne révèle pas l'existence des fiches d'autres propriétaires).
async function getOwnedCat(catId: string, ownerId: string): Promise<Cat> {
  const cat = await prisma.cat.findUnique({ where: { id: catId } });
  if (!cat || cat.ownerId !== ownerId) {
    throw new HttpError(404, "Chat introuvable.");
  }
  return cat;
}

/// GET /api/cats/[id] — détail d'un chat de l'utilisateur courant.
export function GET(_req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    const cat = await getOwnedCat(id, user.id);
    return json({ cat });
  });
}

/// PATCH /api/cats/[id] — met à jour une fiche chat.
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    await getOwnedCat(id, user.id);
    const data = await parseJson(req, catUpdateSchema);
    const cat = await prisma.cat.update({ where: { id }, data });
    return json({ cat });
  });
}

/// DELETE /api/cats/[id] — supprime une fiche chat.
export function DELETE(_req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    await getOwnedCat(id, user.id);

    // Un chat rattaché à une réservation ne peut pas être supprimé : la clé
    // étrangère BookingCat.catId est en Restrict côté base de données.
    const linkedBookings = await prisma.bookingCat.count({ where: { catId: id } });
    if (linkedBookings > 0) {
      throw new HttpError(
        409,
        "Ce chat est rattaché à des réservations et ne peut pas être supprimé.",
      );
    }

    await prisma.cat.delete({ where: { id } });
    return json({ ok: true });
  });
}
