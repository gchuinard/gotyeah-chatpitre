import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getBooking, getCat, getClient } from "@/lib/fixtures";
import { InvoicePdf } from "@/lib/invoice-pdf";

/// GET /api/invoices/[bookingId]/pdf — renvoie la facture PDF pour le
/// séjour. Authentification : session valide requise, et soit l'utilisateur
/// est admin, soit le séjour lui appartient (vérification ownership
/// désactivée tant que les fixtures sont déconnectées du compte utilisateur
/// — sera réactivée avec le câblage Prisma).
///
/// Lecture par renderToBuffer + envoi avec Content-Type application/pdf.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { bookingId } = await params;
  const booking = getBooking(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Séjour introuvable" }, { status: 404 });
  }

  // TODO (prompt #3 data) : vérifier que booking.ownerId === user.id si
  // non-admin. Aujourd'hui les fixtures utilisent des owners synthétiques
  // (u-1 etc.) qui ne correspondent pas aux ids Prisma — on s'appuie sur
  // la session pour limiter la fuite mais on n'a pas la propriété fine.
  void isAdmin;

  const client = getClient(booking.ownerId);
  const cats = booking.catIds
    .map((id) => getCat(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  if (!client) {
    return NextResponse.json(
      { error: "Client introuvable dans les fixtures" },
      { status: 404 },
    );
  }

  const buffer = await renderToBuffer(
    <InvoicePdf booking={booking} client={client} cats={cats} />,
  );

  const filename = `facture-le-chat-pitre-${booking.reference}.pdf`;
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
