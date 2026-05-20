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
