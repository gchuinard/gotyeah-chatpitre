import { prisma } from "@/lib/db";
import { handle, json, requireAdmin } from "@/lib/api";

/// GET /api/admin/bookings — liste toutes les réservations (admin uniquement).
export function GET() {
  return handle(async () => {
    await requireAdmin();
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        cats: { include: { cat: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return json({ bookings });
  });
}
