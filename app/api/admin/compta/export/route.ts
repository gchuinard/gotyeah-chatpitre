import type { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/api";
import { toCsv, type PaymentRow } from "@/lib/accounting";
import { periodBounds, resolvePeriod } from "@/lib/accounting-period";
import {
  displayRef,
  formatDate,
  getPaymentsForPeriod,
} from "@/lib/repository";

/// GET /api/admin/compta/export — export CSV des versements d'une période.
///
/// Une route et non un bouton qui fabriquerait le fichier dans le navigateur :
/// le téléchargement passe par un simple lien, il fonctionne donc sans
/// JavaScript, et les données ne transitent pas par le client.
export async function GET(req: NextRequest) {
  // Pas de `handle()` ici : cette route ne renvoie pas du JSON, et son
  // enveloppe d'erreur transformerait le fichier en réponse illisible.
  await requireAdmin();

  const period = resolvePeriod(
    req.nextUrl.searchParams.get("periode") ?? undefined,
  );
  const { from, to } = periodBounds(period, new Date());
  const payments = await getPaymentsForPeriod(from, to);

  const rows: PaymentRow[] = payments.map((p) => ({
    id: p.id,
    bookingId: p.booking.id,
    bookingRef: displayRef(p.booking.id),
    clientName: `${p.booking.user.firstName} ${p.booking.user.lastName}`,
    amountCents: Math.round(Number(p.amount) * 100),
    method: p.method,
    paidAtISO: p.paidAt.toISOString(),
    paidAtLabel: formatDate(p.paidAt),
    reference: p.reference,
    recordedByLabel: p.recordedBy?.firstName ?? null,
  }));

  // Nom de fichier daté : deux exports successifs ne doivent pas s'écraser
  // dans le dossier de téléchargements.
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `chatpitre-encaissements-${period}-${stamp}.csv`;

  return new Response(toCsv(rows), {
    headers: {
      // charset=utf-8 en plus du BOM : les deux se complètent, certains
      // tableurs lisent l'en-tête, d'autres seulement les premiers octets.
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Données comptables : ni cache navigateur, ni cache intermédiaire.
      "Cache-Control": "private, no-store",
    },
  });
}
