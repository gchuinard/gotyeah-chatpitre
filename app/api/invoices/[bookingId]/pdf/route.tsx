import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser, isAdmin } from "@/lib/auth";
import { displayRef, getBookingFor } from "@/lib/repository";
import { InvoicePdf } from "@/lib/invoice-pdf";

/// GET /api/invoices/[bookingId]/pdf — renvoie la facture PDF du séjour.
/// Authentification : session valide requise, et le séjour doit appartenir
/// à l'utilisateur OU il doit être admin (vérifié par `getBookingFor`).
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
  const admin = isAdmin(user);
  const booking = await getBookingFor(bookingId, user.id, admin);
  if (!booking) {
    return NextResponse.json({ error: "Séjour introuvable" }, { status: 404 });
  }

  // La facture n'existe qu'à partir du moment où le devis est posé. Côté
  // client : il faut aussi que le séjour soit accepté/terminé (un brouillon
  // tarifé pendant que le statut est encore PENDING reste invisible).
  if (booking.totalAmount === null) {
    return NextResponse.json(
      { error: "Aucun devis posé sur ce séjour." },
      { status: 409 },
    );
  }
  if (!admin && !["ACCEPTED", "COMPLETED"].includes(booking.status)) {
    return NextResponse.json(
      { error: "La facture sera disponible une fois le devis accepté." },
      { status: 409 },
    );
  }

  const client = booking.user;
  const cats = booking.cats.map((link) => link.cat);

  const buffer = await renderToBuffer(
    <InvoicePdf booking={booking} client={client} cats={cats} />,
  );

  const filename = `facture-le-chat-pitre-${displayRef(booking.id)}.pdf`;
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
