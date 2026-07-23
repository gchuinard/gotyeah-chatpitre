import { isCronAuthorized } from "@/lib/cron";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/// Purge des notifications lues depuis longtemps.
///
/// Première tâche planifiée du projet, et volontairement la plus anodine : elle
/// sert autant à faire le ménage qu'à éprouver la mécanique avant de lui
/// confier la suppression de photos, qui elle est irréversible.
///
/// Seules les notifications LUES sont touchées, et seulement au-delà de trente
/// jours. Une notification non lue reste, quel que soit son âge : elle porte
/// une information que personne n'a encore vue.
const RETENTION_DAYS = 30;

export async function POST(req: Request) {
  if (!isCronAuthorized(req)) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const before = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const { count } = await prisma.notification.deleteMany({
      where: { readAt: { not: null, lt: before } },
    });
    // Le compte est toujours renvoyé, même à zéro : une tâche qui répond « ok »
    // sans rien dire est indistinguable d'une tâche qui ne tourne plus.
    return Response.json({ deleted: count });
  } catch (err) {
    console.error("[cron/notifications-cleanup] échec :", err);
    return Response.json({ error: "Erreur interne." }, { status: 500 });
  }
}
