import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Booking, BookingExtra, Cat, User } from "@prisma/client";

import { EXTRA_UNIT_LABEL, extraUnitMultiplier } from "@/lib/extras";
import { displayRef, formatDate, nightsBetween } from "@/lib/format";

// Couleurs du DA — en valeurs absolues parce que @react-pdf/renderer ne
// résout pas les CSS custom properties. On reste fidèle aux jewel-tones
// mais sur fond blanc print-friendly.
const COLORS = {
  ink: "#0A0A0A",
  inkSoft: "#2F2A26",
  mute: "#6F6A64",
  cobalt: "#1A4B8E",
  paprika: "#C9532E",
  canari: "#F4C20D",
  rule: "#1A1A1A",
  paperDeep: "#FFF8E5",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.ink,
    lineHeight: 1.45,
  },
  // ----- HEADER -----
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: `1.2pt solid ${COLORS.ink}`,
    paddingBottom: 14,
  },
  brand: {
    fontFamily: "Times-BoldItalic",
    fontSize: 28,
    color: COLORS.ink,
    letterSpacing: -0.6,
  },
  brandSubtitle: {
    fontFamily: "Times-Italic",
    fontSize: 10,
    color: COLORS.inkSoft,
    marginTop: 2,
  },
  invoiceMeta: {
    alignItems: "flex-end",
  },
  invoiceWord: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 3,
    color: COLORS.paprika,
    marginBottom: 6,
  },
  invoiceNumber: {
    fontFamily: "Times-Bold",
    fontSize: 18,
    color: COLORS.ink,
    letterSpacing: -0.3,
  },
  invoiceDate: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: COLORS.mute,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  // ----- PARTIES -----
  parties: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 24,
  },
  partyBlock: {
    flex: 1,
  },
  partyLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 2,
    color: COLORS.cobalt,
    marginBottom: 6,
  },
  partyName: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    color: COLORS.ink,
    marginBottom: 4,
  },
  partyLine: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.inkSoft,
  },
  // ----- OBJET -----
  objet: {
    marginTop: 28,
    borderTop: `0.5pt solid ${COLORS.rule}`,
    borderBottom: `0.5pt solid ${COLORS.rule}`,
    paddingVertical: 14,
  },
  objetLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 2,
    color: COLORS.paprika,
    marginBottom: 6,
  },
  objetTitle: {
    fontFamily: "Times-Italic",
    fontSize: 16,
    color: COLORS.ink,
    marginBottom: 8,
  },
  objetCats: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.inkSoft,
  },
  // ----- TABLEAU -----
  table: {
    marginTop: 24,
  },
  tableHead: {
    flexDirection: "row",
    borderBottom: `1pt solid ${COLORS.ink}`,
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableHeadCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 2,
    color: COLORS.cobalt,
    textTransform: "uppercase",
  },
  colDesignation: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colUnit: { flex: 1.4, textAlign: "right" },
  colTotal: { flex: 1.4, textAlign: "right" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottom: `0.3pt solid ${COLORS.mute}`,
  },
  designationTitle: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    color: COLORS.ink,
    marginBottom: 2,
  },
  designationGloss: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.inkSoft,
    lineHeight: 1.4,
  },
  amountText: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: COLORS.ink,
  },
  amountMono: {
    fontFamily: "Courier-Bold",
    fontSize: 11,
    color: COLORS.ink,
  },
  // ----- TOTAUX -----
  totals: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalsTable: {
    width: 240,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: COLORS.inkSoft,
  },
  totalValue: {
    fontFamily: "Courier",
    fontSize: 10,
    color: COLORS.ink,
  },
  totalTTC: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTop: `1pt solid ${COLORS.ink}`,
    borderBottom: `1pt solid ${COLORS.ink}`,
    marginTop: 4,
  },
  totalTTCLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    letterSpacing: 1,
    color: COLORS.ink,
    textTransform: "uppercase",
  },
  totalTTCValue: {
    fontFamily: "Courier-Bold",
    fontSize: 14,
    color: COLORS.ink,
  },
  acompteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  soldeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginTop: 4,
    backgroundColor: COLORS.paperDeep,
    paddingHorizontal: 8,
  },
  soldeLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: COLORS.paprika,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  soldeValue: {
    fontFamily: "Courier-Bold",
    fontSize: 14,
    color: COLORS.paprika,
  },
  // ----- FOOTER -----
  conditions: {
    marginTop: 36,
    paddingTop: 14,
    borderTop: `0.5pt solid ${COLORS.rule}`,
  },
  conditionsTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 2,
    color: COLORS.paprika,
    marginBottom: 6,
  },
  conditionsText: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: COLORS.inkSoft,
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: COLORS.mute,
    fontFamily: "Helvetica",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});

export type InvoicePdfData = {
  booking: Booking & { extras: BookingExtra[] };
  client: Pick<User, "firstName" | "lastName" | "email" | "phone">;
  cats: Cat[];
  /** Numéro de facture, par défaut dérivé de l'id du séjour. */
  invoiceNumber?: string;
  /** Date d'émission de la facture (« 23 mai 2026 »). */
  issuedAt?: string;
};

function formatAmount(n: number): string {
  return `${n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}€`;
}

export function InvoicePdf({
  booking,
  client,
  cats,
  invoiceNumber,
  issuedAt,
}: InvoicePdfData) {
  const shortRef = displayRef(booking.id);
  const ref = invoiceNumber ?? `2026-${shortRef}`;
  const issued = issuedAt ?? new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const nights = nightsBetween(booking.startDate, booking.endDate);
  const total = Number(booking.totalAmount ?? 0);
  const acompte = Number(booking.depositAmount ?? 0);
  const solde = total - acompte;
  // Tarif par nuit reconstitué : 1er chat + extras (cohérent avec le calcul
  // figé au moment où l'admin pose le devis, cf. lib/pricing.ts).
  const extraCats = Math.max(0, cats.length - 1);
  const pricePerNight =
    Number(booking.pricePerFirstCat ?? 0) +
    extraCats * Number(booking.pricePerExtraCat ?? 0);
  const nightsSubtotal = pricePerNight * nights;
  const designation =
    cats.length === 1
      ? `Séjour d'un chat`
      : `Séjour de ${cats.length} chats du même foyer`;
  const catsLabel = cats
    .map((c) => (c.breed ? `${c.name} (${c.breed})` : c.name))
    .join(", ");

  return (
    <Document
      title={`Facture ${ref}, Le Chat-Pitre`}
      author="Le Chat-Pitre"
      subject={`Facture pour le séjour N°${shortRef}`}
    >
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Le Chat-Pitre</Text>
            <Text style={styles.brandSubtitle}>
              Maison de villégiature pour félins de bonne compagnie
            </Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceWord}>FACTURE</Text>
            <Text style={styles.invoiceNumber}>N°{ref}</Text>
            <Text style={styles.invoiceDate}>ÉMISE LE {issued.toUpperCase()}</Text>
          </View>
        </View>

        {/* PARTIES */}
        <View style={styles.parties}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>ÉMETTEUR</Text>
            <Text style={styles.partyName}>Le Chat-Pitre</Text>
            <Text style={styles.partyLine}>N° 047, rue de la Chartreuse</Text>
            <Text style={styles.partyLine}>33000 Bordeaux</Text>
            <Text style={styles.partyLine}>bonjour@chat-pitre.fr</Text>
            <Text style={[styles.partyLine, { marginTop: 6, color: COLORS.mute }]}>
              SIRET : à compléter
            </Text>
            <Text style={[styles.partyLine, { color: COLORS.mute }]}>
              TVA non applicable, art. 293 B du CGI
            </Text>
          </View>

          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>ADRESSÉE À</Text>
            <Text style={styles.partyName}>
              {client.firstName} {client.lastName}
            </Text>
            <Text style={styles.partyLine}>{client.email}</Text>
            {client.phone && (
              <Text style={styles.partyLine}>{client.phone}</Text>
            )}
          </View>
        </View>

        {/* OBJET */}
        <View style={styles.objet}>
          <Text style={styles.objetLabel}>OBJET DU SÉJOUR</Text>
          <Text style={styles.objetTitle}>
            Du {formatDate(booking.startDate)} au {formatDate(booking.endDate)}
          </Text>
          <Text style={styles.objetCats}>{catsLabel}</Text>
        </View>

        {/* TABLEAU */}
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadCell, styles.colDesignation]}>
              Désignation
            </Text>
            <Text style={[styles.tableHeadCell, styles.colQty]}>Nuits</Text>
            <Text style={[styles.tableHeadCell, styles.colUnit]}>
              Prix unitaire
            </Text>
            <Text style={[styles.tableHeadCell, styles.colTotal]}>
              Total HT
            </Text>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.colDesignation}>
              <Text style={styles.designationTitle}>{designation}</Text>
              <Text style={styles.designationGloss}>
                Repas, litière, ménage quotidien et observation incluse.
                Carnet de séjour photo+note disponible en ligne pendant
                toute la durée.
                {booking.clientNotes ? ` Note : ${booking.clientNotes}` : ""}
              </Text>
            </View>
            <Text style={[styles.amountText, styles.colQty]}>
              {nights}
            </Text>
            <Text style={[styles.amountMono, styles.colUnit]}>
              {formatAmount(pricePerNight)}
            </Text>
            <Text style={[styles.amountMono, styles.colTotal]}>
              {formatAmount(nightsSubtotal)}
            </Text>
          </View>

          {booking.extras.map((extra) => {
            const qty = extraUnitMultiplier(extra.unit, extra.quantity, nights);
            return (
              <View key={extra.id} style={styles.tableRow}>
                <View style={styles.colDesignation}>
                  <Text style={styles.designationTitle}>{extra.label}</Text>
                  <Text style={styles.designationGloss}>
                    Supplément {EXTRA_UNIT_LABEL[extra.unit]}.
                  </Text>
                </View>
                <Text style={[styles.amountText, styles.colQty]}>
                  {extra.unit === "FLAT" ? "—" : qty}
                </Text>
                <Text style={[styles.amountMono, styles.colUnit]}>
                  {extra.unitAmount === null
                    ? "—"
                    : formatAmount(Number(extra.unitAmount))}
                </Text>
                <Text style={[styles.amountMono, styles.colTotal]}>
                  {formatAmount(Number(extra.amount ?? 0))}
                </Text>
              </View>
            );
          })}
        </View>

        {/* TOTAUX */}
        <View style={styles.totals}>
          <View style={styles.totalsTable}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total HT</Text>
              <Text style={styles.totalValue}>
                {formatAmount(total)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA</Text>
              <Text style={[styles.totalValue, { fontFamily: "Helvetica-Oblique", color: COLORS.mute }]}>
                non applicable
              </Text>
            </View>

            <View style={styles.totalTTC}>
              <Text style={styles.totalTTCLabel}>Total TTC</Text>
              <Text style={styles.totalTTCValue}>
                {formatAmount(total)}
              </Text>
            </View>

            <View style={styles.acompteRow}>
              <Text style={styles.totalLabel}>
                Acompte {booking.depositPercentage} % (à la réservation)
              </Text>
              <Text style={styles.totalValue}>
                − {formatAmount(acompte)}
              </Text>
            </View>

            <View style={styles.soldeRow}>
              <Text style={styles.soldeLabel}>Solde dû</Text>
              <Text style={styles.soldeValue}>{formatAmount(solde)}</Text>
            </View>
          </View>
        </View>

        {/* CONDITIONS */}
        <View style={styles.conditions}>
          <Text style={styles.conditionsTitle}>CONDITIONS DE PAIEMENT</Text>
          <Text style={styles.conditionsText}>
            Paiement à réception par virement bancaire. Pénalités de retard :
            trois fois le taux d&apos;intérêt légal en vigueur. Indemnité
            forfaitaire pour frais de recouvrement : 40 €. TVA non applicable,
            article 293 B du Code général des impôts.
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text>Le Chat-Pitre · Bordeaux</Text>
          <Text>Facture {ref}</Text>
        </View>
      </Page>
    </Document>
  );
}
