import Link from "next/link";

import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Td, Th } from "@/components/ui/sortable-th";
import {
  computeTotals,
  formatCents,
  PAYMENT_METHOD_LABEL,
  PAYMENT_METHODS,
  type PaymentRow,
} from "@/lib/accounting";
import {
  periodBounds,
  PERIOD_LABEL,
  resolvePeriod,
  type PeriodKey,
} from "@/lib/accounting-period";
import {
  displayRef,
  formatDate,
  getOutstandingCents,
  getPaymentsForPeriod,
} from "@/lib/repository";

/// Onglet Compta : tous les versements, toutes fiches confondues.
///
/// Le détail par séjour existait depuis le 2026-07-19, mais il n'existait QUE
/// sur la fiche du séjour concerné : savoir ce qui était rentré dans le mois
/// imposait d'ouvrir les séjours un par un et d'additionner à la main.
///
/// Cette page ne fait qu'agréger et afficher. C'était le pari du modèle de
/// versements livré en Admin v1.5, et il paie ici : aucune migration.

const PERIODS: PeriodKey[] = ["month", "year", "all"];

export default async function AdminAccountingPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const period = resolvePeriod((await searchParams).periode);
  const { from, to } = periodBounds(period, new Date());

  const [payments, outstandingCents] = await Promise.all([
    getPaymentsForPeriod(from, to),
    getOutstandingCents(),
  ]);

  const rows: PaymentRow[] = payments.map((p) => ({
    id: p.id,
    bookingId: p.booking.id,
    bookingRef: displayRef(p.booking.id),
    clientName: `${p.booking.user.firstName} ${p.booking.user.lastName}`,
    // Arrondi à l'entier le plus proche : Number() sur un Decimal peut rendre
    // 10.099999999999999, que tronquer donnerait 1009 centimes au lieu de 1010.
    amountCents: Math.round(Number(p.amount) * 100),
    method: p.method,
    paidAtISO: p.paidAt.toISOString(),
    paidAtLabel: formatDate(p.paidAt),
    reference: p.reference,
    recordedByLabel: p.recordedBy?.firstName ?? null,
  }));

  const totals = computeTotals(rows);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/admin" className="hover:text-cp-paprika">
          Administration
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Compta</span>
      </nav>

      <header className="space-y-5">
        <LibraryStamp boxed>Suivi financier</LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Ce qui est rentré.
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          {PERIOD_LABEL[period].toLowerCase()}, {totals.count} versement
          {totals.count > 1 ? "s" : ""} pour {formatCents(totals.totalCents)}.
        </p>
      </header>

      <RuleDivider className="my-12" tone="paprika" />

      {/* Période : de vrais liens portés par l'URL, comme les onglets. La page
          se partage, se recharge et se met en favori sans rien perdre. */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Période" className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={p === "month" ? "/admin/compta" : `/admin/compta?periode=${p}`}
              aria-current={p === period ? "page" : undefined}
              className={buttonVariants({
                variant: p === period ? "default" : "outline",
                size: "sm",
              })}
            >
              {PERIOD_LABEL[p]}
            </Link>
          ))}
        </nav>

        {rows.length > 0 && (
          <a
            href={`/api/admin/compta/export?periode=${period}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Exporter en CSV
          </a>
        )}
      </div>

      {/* Ventilation par moyen de paiement : c'est elle qui sert au pointage
          d'un relevé bancaire, où espèces et virements ne se retrouvent pas au
          même endroit. */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PAYMENT_METHODS.map((m) => (
          <div
            key={m}
            className="rounded-md border border-cp-ink bg-cp-paper p-5"
          >
            <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] text-cp-paprika">
              {PAYMENT_METHOD_LABEL[m]}
            </p>
            <p className="mt-1 font-display text-3xl font-bold leading-none text-cp-ink">
              {formatCents(totals.byMethodCents[m])}
            </p>
          </div>
        ))}
      </section>

      {outstandingCents > 0 && (
        <RuledBox variant="deep" className="mt-6">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-paprika">
            Reste dû, tous séjours confondus
          </p>
          <p className="mt-1 font-display text-3xl font-bold leading-none text-cp-ink">
            {formatCents(outstandingCents)}
          </p>
          <p className="mt-2 font-body text-sm text-cp-ink-soft">
            Séjours chiffrés et non soldés, annulations exclues. Indépendant de
            la période choisie.
          </p>
        </RuledBox>
      )}

      <RuleDivider className="my-12" />

      <section className="space-y-6">
        <SectionHeading
          title="Versements"
          kicker="Du plus récent au plus ancien."
          tone="cobalt"
        />

        {rows.length === 0 ? (
          <RuledBox variant="deep">
            <p className="font-display text-2xl italic text-cp-ink">
              Aucun versement sur cette période.
            </p>
          </RuledBox>
        ) : (
          <div className="overflow-x-auto rounded-md border border-cp-ink">
            <table className="w-full min-w-[56rem] border-collapse text-left">
              <thead className="bg-cp-paper-deep">
                <tr>
                  <Th>Date</Th>
                  <Th className="text-right">Montant</Th>
                  <Th>Moyen</Th>
                  <Th>Séjour</Th>
                  <Th>Client</Th>
                  <Th>Référence</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <PaymentLine key={r.id} row={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/// Une ligne de versement.
///
/// Le lien porte sur le numéro de séjour et non sur la ligne entière : ici on
/// vient LIRE des chiffres et les recopier, or une ligne cliquable navigue au
/// moindre glissement de sélection.
function PaymentLine({ row }: { row: PaymentRow }) {
  return (
    <tr className="border-t border-cp-ink/20 transition-colors hover:bg-cp-paper-deep/40">
      <Td>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-cp-ink">
          {row.paidAtLabel}
        </p>
      </Td>
      <Td className="text-right">
        <p className="font-display text-xl font-bold leading-none text-cp-ink">
          {formatCents(row.amountCents)}
        </p>
      </Td>
      <Td>
        <span className="inline-flex items-center rounded-full border border-cp-ink/30 px-2.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-ink-soft">
          {PAYMENT_METHOD_LABEL[row.method]}
        </span>
      </Td>
      <Td>
        <Link
          href={`/admin/bookings/${row.bookingId}`}
          className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cp-paprika hover:underline"
        >
          N°{row.bookingRef}
        </Link>
      </Td>
      <Td>
        <p className="font-body text-sm text-cp-ink">{row.clientName}</p>
      </Td>
      <Td>
        <p className="font-body text-xs text-cp-ink-soft">
          {row.reference ?? "sans référence"}
          {row.recordedByLabel && ` · saisi par ${row.recordedByLabel}`}
        </p>
      </Td>
    </tr>
  );
}
