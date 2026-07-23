import { photoExpiryBefore, PHOTO_RETENTION_DAYS } from "@/lib/cat-photos";
import { isCronAuthorized } from "@/lib/cron";
import { prisma } from "@/lib/db";
import { deleteDocument } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/// Effacement des photos de séjour au-delà du délai de rétention.
///
/// C'est LA tâche qui a rendu l'ordonnanceur nécessaire. L'espace Photos
/// annonce au propriétaire que ses photos sont effacées au bout de trente
/// jours : un filtre calculé à l'affichage les aurait seulement masquées, en
/// laissant les fichiers sur le disque. La promesse serait devenue un mensonge.
///
/// Traitement borné à 200 photos par passage. Une tâche qui viderait des
/// milliers de fichiers d'un coup tiendrait la base et le disque du Pi ; le
/// reliquat part au passage suivant, la cadence quotidienne laissant largement
/// le temps de rattraper.
const BATCH = 200;

export async function POST(req: Request) {
  if (!isCronAuthorized(req)) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const before = photoExpiryBefore(new Date());
    const expired = await prisma.catPhoto.findMany({
      where: { createdAt: { lt: before } },
      select: { id: true, storageKey: true },
      take: BATCH,
      orderBy: { createdAt: "asc" },
    });

    let filesDeleted = 0;
    const rowsToDelete: string[] = [];

    for (const photo of expired) {
      try {
        await deleteDocument(photo.storageKey);
        filesDeleted += 1;
        rowsToDelete.push(photo.id);
      } catch (err) {
        // La ligne est CONSERVÉE quand le fichier résiste : la supprimer
        // laisserait un fichier orphelin que plus rien ne désigne, donc
        // impossible à retrouver. On réessaiera au passage suivant.
        console.error("[cron/photos-cleanup] fichier non effacé :", photo.storageKey, err);
      }
    }

    if (rowsToDelete.length > 0) {
      await prisma.catPhoto.deleteMany({ where: { id: { in: rowsToDelete } } });
    }

    return Response.json({
      retentionDays: PHOTO_RETENTION_DAYS,
      expired: expired.length,
      filesDeleted,
      rowsDeleted: rowsToDelete.length,
      // Dit s'il reste du travail : un lot plein signale que le passage
      // suivant aura encore à faire, ce qui est visible dans le journal.
      hasMore: expired.length === BATCH,
    });
  } catch (err) {
    console.error("[cron/photos-cleanup] échec :", err);
    return Response.json({ error: "Erreur interne." }, { status: 500 });
  }
}
