import type { NextRequest } from "next/server";
import type { Cat } from "@prisma/client";
import { prisma } from "@/lib/db";
import { handle, HttpError, json, parseJson, requireUser } from "@/lib/api";
import { deleteDocument } from "@/lib/storage";
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
    //
    // Ce n'est pas une limite à contourner, c'est la bonne règle : effacer un
    // chat qui figure sur des séjours facturés casserait l'historique et les
    // factures. Le message oriente donc vers ce qu'il faut faire à la place.
    const linkedBookings = await prisma.bookingCat.count({ where: { catId: id } });
    if (linkedBookings > 0) {
      throw new HttpError(
        409,
        "Ce chat a déjà séjourné chez nous, sa fiche ne peut pas être supprimée sans effacer son historique.",
      );
    }

    // Les clés de stockage sont relevées AVANT la suppression : la cascade
    // efface les lignes CatDocument, après quoi plus rien ne dirait quels
    // fichiers effacer, et ils resteraient orphelins sur le disque du Pi.
    const documents = await prisma.catDocument.findMany({
      where: { catId: id },
      select: { storageKey: true },
    });

    await prisma.cat.delete({ where: { id } });

    // Après la base, et sans faire échouer la requête : la fiche est déjà
    // supprimée, refuser maintenant laisserait l'utilisateur croire que rien
    // n'a eu lieu. deleteDocument ignore déjà les fichiers absents.
    for (const doc of documents) {
      try {
        await deleteDocument(doc.storageKey);
      } catch {
        // Fichier resté sur le disque : sans conséquence fonctionnelle, la
        // ligne qui le désignait n'existe plus.
      }
    }

    return json({ ok: true });
  });
}
