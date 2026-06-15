import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CatReviewControl } from "@/components/cat-review-control";
import { ConversationView } from "@/components/conversation-view";
import { LibraryStamp } from "@/components/library-stamp";
import { QuoteForm } from "@/components/quote-form";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { StayJournal } from "@/components/stay-journal";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeBookingPricing } from "@/lib/pricing";
import {
  ageLabel,
  displayRef,
  formatDate,
  getBookingFor,
  nightsBetween,
} from "@/lib/repository";

/// Détail admin d'un séjour — Prisma + actions de changement de statut
/// PATCH + ConversationView qui POST réellement + carnet wired.

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) return null;

  const booking = await getBookingFor(id, user.id, true);
  if (!booking) notFound();

  const cats = booking.cats.map((link) => link.cat);
  const client = booking.user;
  const nights = nightsBetween(booking.startDate, booking.endDate);
  const ref = displayRef(booking.id);
  const awaitingQuote = ["PENDING", "QUESTION_ASKED"].includes(booking.status);
  const hasQuote = booking.totalAmount !== null;
  // Le carnet de séjour n'a de sens qu'une fois le séjour validé : masqué tant
  // que la demande n'est pas acceptée (ou terminée).
  const showJournal = ["ACCEPTED", "COMPLETED"].includes(booking.status);
  const extrasTotal = booking.extras.reduce(
    (sum, e) => sum + Number(e.amount ?? 0),
    0,
  );
  // Valeurs suggérées (lues dans Setting via computeBookingPricing) +
  // catalogue de presets — passés au QuoteForm pour pré-remplir un nouveau
  // devis et alimenter le sélecteur de suppléments.
  const [suggested, presets] = awaitingQuote
    ? await Promise.all([
        computeBookingPricing(booking.startDate, booking.endDate, cats.length),
        prisma.extraPreset.findMany({ orderBy: { sortOrder: "asc" } }),
      ])
    : [null, []];

  const messages = booking.messages.map((m) => ({
    id: m.id,
    body: m.content,
    fromAdmin: m.isFromAdmin,
    authorLabel: m.isFromAdmin
      ? "La maison"
      : `${m.author.firstName}`,
    sentAt: m.createdAt.toISOString(),
  }));

  return (
    <article className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
      {/* Fil d'Ariane */}
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/admin" className="hover:text-cp-paprika">
          Administration
        </Link>
        <span aria-hidden>/</span>
        <Link href="/admin/bookings" className="hover:text-cp-paprika">
          Séjours
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">N° {ref}</span>
      </nav>

      <header className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <LibraryStamp boxed>
            Séjour N° {ref} — {nights} nuit{nights > 1 ? "s" : ""}
          </LibraryStamp>
          <BookingStatusBadge status={booking.status} />
        </div>

        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Du {formatDate(booking.startDate)}
          <br />
          <span className="italic font-normal">au {formatDate(booking.endDate)}.</span>
        </h1>

        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          {cats.map((c) => c.name).join(" · ")} — confiés par{" "}
          {client.firstName} {client.lastName}.
        </p>
      </header>

      <RuleDivider className="my-12" />

      {/* Récap client + (devis ou tarif posé) */}
      <section className="grid gap-4 lg:grid-cols-3">
        <DetailTile label="Client">
          <p className="font-display text-2xl italic leading-tight text-cp-ink">
            {client.firstName} {client.lastName}
          </p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
            {client.email}
            {client.phone && (
              <>
                <br />
                {client.phone}
              </>
            )}
          </p>
        </DetailTile>
        {hasQuote ? (
          <>
            <DetailTile label="Tarif total">
              <p className="font-display text-4xl font-bold leading-none text-cp-ink sm:text-5xl">
                {Number(booking.totalAmount).toLocaleString("fr-FR")}€
              </p>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
                {Number(booking.pricePerFirstCat)}€ + {Number(booking.pricePerExtraCat)}€ × {cats.length - 1} · {nights} nuits
                {extrasTotal > 0 && (
                  <> · +{extrasTotal.toLocaleString("fr-FR")}€ de suppléments</>
                )}
              </p>
            </DetailTile>
            <DetailTile label={`Acompte ${booking.depositPercentage} %`}>
              <p className="font-display text-4xl font-bold leading-none text-cp-ink sm:text-5xl">
                {Number(booking.depositAmount).toLocaleString("fr-FR")}€
              </p>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
                À encaisser à la réservation
              </p>
            </DetailTile>
          </>
        ) : (
          <DetailTile label="Devis">
            <p className="font-display text-2xl italic leading-tight text-cp-cobalt">
              {awaitingQuote ? "À établir ci-dessous" : "Non chiffré"}
            </p>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
              {awaitingQuote
                ? "Posez le tarif avant d'accepter"
                : "Aucun tarif enregistré"}
            </p>
          </DetailTile>
        )}
      </section>

      {/* Pensionnaires détaillés */}
      <section className="mt-10 space-y-6">
        <SectionHeading
          number="01"
          title="Pensionnaires concernés"
          kicker={`${cats.length} fiche${cats.length > 1 ? "s" : ""} à valider avant l'arrivée.`}
        />
        <ul className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink sm:grid-cols-2">
          {booking.cats.map((link) => (
            <li key={link.cat.id} className="flex flex-col gap-3 bg-cp-paper p-5">
              <header className="flex items-baseline justify-between gap-3">
                <p className="font-display text-2xl italic leading-tight text-cp-ink">
                  {link.cat.name}
                </p>
                <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cp-paprika">
                  N° {displayRef(link.cat.id)}
                </p>
              </header>
              <p className="font-body text-sm text-cp-ink-soft">
                {link.cat.breed} · {ageLabel(link.cat.birthDate)}
              </p>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-cp-ink/30 pt-3 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em]">
                <Criterion ok={link.cat.isSterilized} label="Stérilisé" />
                <Criterion ok={link.cat.isIdentified} label="Identifié" />
                <Criterion ok={link.cat.vaccinesUpToDate} label="Vaccins" />
                <Criterion ok={link.cat.isSociable} label="Sociable" />
              </ul>
              <CatReviewControl
                bookingId={booking.id}
                catId={link.cat.id}
                initialStatus={link.reviewStatus}
                initialNote={link.reviewNote}
              />
            </li>
          ))}
        </ul>
      </section>

      {booking.clientNotes && (
        <RuledBox variant="deep" className="mt-10">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
            Note du client
          </p>
          <p className="mt-3 font-body text-base leading-relaxed text-cp-ink">
            {booking.clientNotes}
          </p>
        </RuledBox>
      )}

      {booking.adminNotes && (
        <RuledBox className="mt-6">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-cobalt">
            Note interne admin
          </p>
          <p className="mt-3 font-body text-base leading-relaxed text-cp-ink">
            {booking.adminNotes}
          </p>
        </RuledBox>
      )}

      {/* Facture PDF — uniquement quand le devis est posé. */}
      {hasQuote && (
        <aside className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-md border border-cp-cobalt bg-cp-paper-deep p-5 sm:p-6">
          <div>
            <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-cobalt">
              Facture du séjour
            </p>
            <p className="mt-1 font-display text-xl italic text-cp-ink">
              Aperçu de la facture PDF envoyée au client.
            </p>
          </div>
          <a
            href={`/api/invoices/${booking.id}/pdf`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-md border border-cp-cobalt bg-cp-cobalt px-5 py-2.5 font-body text-sm font-semibold text-cp-paper transition-colors hover:bg-cp-cobalt-deep"
          >
            Ouvrir la facture PDF ↓
          </a>
        </aside>
      )}

      {/* Devis + actions — uniquement tant que PENDING ou QUESTION_ASKED. */}
      {awaitingQuote && suggested && (
        <>
          <QuoteForm
            bookingId={booking.id}
            nights={nights}
            catsCount={cats.length}
            current={{
              pricePerFirstCat:
                booking.pricePerFirstCat === null
                  ? null
                  : Number(booking.pricePerFirstCat),
              pricePerExtraCat:
                booking.pricePerExtraCat === null
                  ? null
                  : Number(booking.pricePerExtraCat),
              depositPercentage: booking.depositPercentage,
              extras: booking.extras.map((e) => ({
                label: e.label,
                unit: e.unit,
                unitAmount: e.unitAmount === null ? null : Number(e.unitAmount),
                quantity: e.quantity,
                requestedByClient: e.requestedByClient,
              })),
            }}
            suggested={{
              pricePerFirstCat: Number(suggested.pricePerFirstCat),
              pricePerExtraCat: Number(suggested.pricePerExtraCat),
              depositPercentage: suggested.depositPercentage,
            }}
            presets={presets.map((p) => ({
              id: p.id,
              label: p.label,
              unit: p.unit,
              defaultAmount: Number(p.defaultAmount),
            }))}
          />
        </>
      )}

      {/* Carnet de séjour — masqué tant que le séjour n'est pas validé. */}
      {showJournal && (
        <>
          <RuleDivider className="my-16" label="Carnet de séjour" tone="cobalt" />
          <section aria-labelledby="journal-title" className="space-y-8">
            <SectionHeading
              number="02"
              title="Carnet de séjour"
              kicker="Une note photo quotidienne — c'est ce que voit le client."
              tone="cobalt"
            />

            <StayJournal bookingId={booking.id} cats={cats} canAdd />
          </section>
        </>
      )}

      <RuleDivider className="my-16" tone="paprika" />

      {/* Fil — POST réel */}
      <section aria-labelledby="thread-title" className="space-y-8">
        <SectionHeading
          number={showJournal ? "03" : "02"}
          title="Échanges avec le client"
          kicker={`${messages.length} message${messages.length > 1 ? "s" : ""} échangé${messages.length > 1 ? "s" : ""} jusqu'ici.`}
          tone="paprika"
        />

        <ConversationView
          bookingId={booking.id}
          initialMessages={messages}
          voice="admin"
          canRespond={awaitingQuote}
        />
      </section>

      <RuleDivider className="my-16" />

      <footer>
        <Link
          href="/admin/bookings"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← Retour à la liste des séjours
        </Link>
      </footer>
    </article>
  );
}

function DetailTile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-cp-ink bg-cp-paper p-6 sm:p-8">
      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
        {label}
      </p>
      {children}
    </div>
  );
}

function Criterion({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={`flex items-center gap-1.5 ${ok ? "text-cp-ink" : "text-cp-paprika"}`}
    >
      <span aria-hidden className="inline-block w-3 text-center">
        {ok ? "✓" : "—"}
      </span>
      <span className={ok ? "" : "line-through decoration-[1.5px]"}>
        {label}
      </span>
    </li>
  );
}
