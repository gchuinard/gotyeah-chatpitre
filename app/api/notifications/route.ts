import { prisma } from "@/lib/db";
import { handle, json, requireUser } from "@/lib/api";

/// GET /api/notifications — liste les notifications de l'utilisateur courant
/// (les plus récentes d'abord).
export function GET() {
  return handle(async () => {
    const user = await requireUser();
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return json({ notifications });
  });
}

/// PATCH /api/notifications — marque toutes les notifications non lues de
/// l'utilisateur courant comme lues. Idempotent : ne touche pas à celles
/// déjà lues, pour conserver leur date de lecture d'origine.
export function PATCH() {
  return handle(async () => {
    const user = await requireUser();
    const { count } = await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return json({ updated: count });
  });
}
