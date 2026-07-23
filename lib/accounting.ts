import type { PaymentMethod } from "@prisma/client";

/// Agrégation comptable : totaux d'une période et export CSV.
///
/// Ce fichier ne touche NI Prisma NI le serveur : il reçoit des lignes déjà
/// lues et rend des chiffres. C'est ce qui le rend vérifiable sans base de
/// données, sur une fonctionnalité où une erreur de calcul se compte en euros.

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Espèces",
  CHEQUE: "Chèque",
  TRANSFER: "Virement",
  OTHER: "Autre",
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH",
  "CHEQUE",
  "TRANSFER",
  "OTHER",
];

export type PaymentRow = {
  id: string;
  bookingId: string;
  bookingRef: string;
  clientName: string;
  /// En CENTIMES, et jamais en nombre à virgule flottante.
  ///
  /// Les montants sont des Decimal en base. Les convertir en flottant pour
  /// additionner réintroduirait les erreurs d'arrondi que ce type existe
  /// précisément pour éviter : 0,1 + 0,2 ne fait pas 0,3 en binaire. Sur des
  /// sommes d'argent, l'écart finit par se voir.
  amountCents: number;
  method: PaymentMethod;
  paidAtISO: string;
  paidAtLabel: string;
  reference: string | null;
  recordedByLabel: string | null;
};

export type AccountingTotals = {
  totalCents: number;
  byMethodCents: Record<PaymentMethod, number>;
  count: number;
};

export function computeTotals(rows: PaymentRow[]): AccountingTotals {
  const byMethodCents: Record<PaymentMethod, number> = {
    CASH: 0,
    CHEQUE: 0,
    TRANSFER: 0,
    OTHER: 0,
  };
  let totalCents = 0;
  for (const r of rows) {
    totalCents += r.amountCents;
    byMethodCents[r.method] += r.amountCents;
  }
  return { totalCents, byMethodCents, count: rows.length };
}

/// « 1 234,50 € » à partir de centimes.
export function formatCents(cents: number): string {
  return `${(cents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

/// Échappe une valeur pour le format CSV.
///
/// Indispensable et pas cosmétique : un nom de client contenant une virgule ou
/// un point-virgule décalerait toutes les colonnes suivantes de sa ligne, et
/// une référence de virement contenant un guillemet casserait le fichier.
function csvCell(value: string): string {
  const needsQuotes = /[";\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

/// Export CSV d'une période, ouvrable directement dans un tableur français.
///
/// Trois choix imposés par Excel en français, et non par goût :
///   * séparateur POINT-VIRGULE, la virgule y sert de séparateur décimal ;
///   * montants avec une VIRGULE décimale, sans symbole € ni séparateur de
///     milliers, sans quoi la colonne reste du texte et ne s'additionne pas ;
///   * BOM UTF-8 en tête, sans lequel les accents s'affichent en mojibake.
export function toCsv(rows: PaymentRow[]): string {
  const header = [
    "Date",
    "Montant",
    "Moyen de paiement",
    "Séjour",
    "Client",
    "Référence",
    "Saisi par",
  ];

  const lines = [
    header.map(csvCell).join(";"),
    ...rows.map((r) =>
      [
        // Date ISO : elle se trie correctement et ne dépend d'aucune locale.
        r.paidAtISO.slice(0, 10),
        (r.amountCents / 100).toFixed(2).replace(".", ","),
        PAYMENT_METHOD_LABEL[r.method],
        r.bookingRef,
        r.clientName,
        r.reference ?? "",
        r.recordedByLabel ?? "",
      ]
        .map(csvCell)
        .join(";"),
    ),
  ];

  // \r\n : la fin de ligne attendue par le format CSV, et la seule que tous
  // les tableurs lisent sans broncher.
  return `﻿${lines.join("\r\n")}\r\n`;
}
