import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CancelBookingButton } from "@/components/cancel-booking-button";
import { ConversationView } from "@/components/conversation-view";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { StayJournal } from "@/components/stay-journal";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { extraUnitGloss } from "@/lib/extras";
import {
  displayRef,
  formatDate,
  getBookingFor,
  nightsBetween,
} from "@/lib/repository";

/// Détail d'un séjour côté client — lecture Prisma avec auth check, fil
/// de discussion qui POST réellement, annulation qui PATCH le statut.

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const booking = await getBookingFor(id, user.id, isAdmin(user));
  if (!booking) notFound();

  const cats = booking.cats.map((link) => link.cat);
  const nights = nightsBetween(booking.startDate, booking.endDate);
  const ref = displayRef(booking.id);

  // Le devis est posé par la maison lors du passage à ACCEPTED. Tant que
  // PENDING ou QUESTION_ASKED, on cache les chiffres et la facture PDF.
  const awaitingQuote = ["PENDING", "QUESTION_ASKED"].includes(booking.status);
  const hasQuote = !awaitingQuote && booking.totalAmount !== null;
  // Le carnet de séjour n'a de sens qu'une fois le séjour validé : on le
  // cache tant que la demande n'est pas acceptée (ou terminée).
  const showJournal = ["ACCEPTED", "COMPLETED"].includes(booking.status);

  // Mappe les messages Prisma vers le format attendu par ConversationView.
  const messages = booking.messages.map((m) => ({
    id: m.id,
    body: m.content,
    fromAdmin: m.isFromAdmin,
    authorLabel: m.isFromAdmin
      ? "La maison"
      : m.author.firstName === user.firstName
        ? "Vous"
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
        <Link href="/dashboard" className="hover:text-cp-paprika">
          Mon espace
        </Link>
        <span aria-hidden>/</span>
        <Link href="/dashboard/bookings" className="hover:text-cp-paprika">
          Séjours
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">N° {ref}</span>
      </nav>

      {/* En-tête éditoriale */}
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
          {cats.map((c) => c.name).join(" · ")} — {nights} nuit
          {nights > 1 ? "s" : ""} pour {cats.length} pensionnaire
          {cats.length > 1 ? "s" : ""}.
        </p>
      </header>

      <RuleDivider className="my-12" />

      {awaitingQuote ? (
        <>
          <aside className="rounded-md border border-cp-cobalt bg-cp-paper-deep p-6 sm:p-8">
            <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-cobalt">
              Devis en cours d&apos;évaluation
            </p>
            <p className="mt-3 font-display text-2xl italic leading-snug text-cp-ink sm:text-3xl">
              La maison étudie votre demande et vous reviendra avec un tarif
              personnalisé sous 48 h.
            </p>
            <p className="mt-3 font-body text-sm text-cp-ink-soft">
              Les nuitées, l&apos;éventuel coût de soins ou nourriture
              particulière et l&apos;acompte vous seront communiqués ici dès
              que le devis sera prêt.
            </p>
          </aside>

          {booking.extras.length > 0 && (
            <RuledBox variant="cobalt" className="mt-6">
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-cobalt">
                Suppléments souhaités
              </p>
              <ul className="mt-3 divide-y divide-cp-cobalt/30">
                {booking.extras.map((extra) => (
                  <li
                    key={extra.id}
                    className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
                  >
                    <span className="flex flex-col">
                      <span className="font-body text-base leading-relaxed text-cp-ink">
                        {extra.label}
                      </span>
                      <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-cp-ink-soft">
                        {extraUnitGloss(
                          extra.unit,
                          extra.unitAmount === null ? null : Number(extra.unitAmount),
                          extra.quantity,
                          nights,
                        )}
                      </span>
                    </span>
                    <span className="font-mono text-sm font-bold whitespace-nowrap text-cp-cobalt">
                      {extra.amount === null
                        ? "à chiffrer"
                        : `~ ${Number(extra.amount).toLocaleString("fr-FR")}€`}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-body text-xs italic text-cp-ink-soft">
                Tarifs indicatifs — la maison les confirme dans le devis final.
              </p>
            </RuledBox>
          )}
        </>
      ) : (
        hasQuote && (
          <>
            {/* Récap chiffres */}
            <section className="grid gap-4 lg:grid-cols-3">
              <DetailTile
                label="Tarif total"
                value={`${Number(booking.totalAmount).toLocaleString("fr-FR")}€`}
                gloss={`${Number(booking.pricePerFirstCat)}€ + ${Number(booking.pricePerExtraCat)}€ × ${cats.length - 1} · ${nights} nuits`}
              />
              <DetailTile
                label="Pensionnaires"
                value={cats.length.toString().padStart(2, "0")}
                gloss={cats.map((c) => c.name).join(" · ")}
              />
              <DetailTile
                label="Acompte"
                value={`${Number(booking.depositAmount).toLocaleString("fr-FR")}€`}
                gloss={`${booking.depositPercentage} % à la réservation`}
              />
            </section>

            {booking.extras.length > 0 && (
              <RuledBox variant="cobalt" className="mt-6">
                <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-cobalt">
                  Suppléments inclus
                </p>
                <ul className="mt-3 divide-y divide-cp-cobalt/30">
                  {booking.extras.map((extra) => (
                    <li
                      key={extra.id}
                      className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
                    >
                      <span className="flex flex-col">
                        <span className="font-body text-base leading-relaxed text-cp-ink">
                          {extra.label}
                        </span>
                        <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-cp-ink-soft">
                          {extraUnitGloss(
                            extra.unit,
                            extra.unitAmount === null ? null : Number(extra.unitAmount),
                            extra.quantity,
                            nights,
                          )}
                        </span>
                      </span>
                      <span className="font-mono text-sm font-bold whitespace-nowrap text-cp-paprika">
                        {extra.amount === null
                          ? "à chiffrer"
                          : `+${Number(extra.amount).toLocaleString("fr-FR")}€`}
                      </span>
                    </li>
                  ))}
                </ul>
              </RuledBox>
            )}
          </>
        )
      )}

      {booking.clientNotes && (
        <RuledBox variant="deep" className="mt-10">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
            Note de séjour
          </p>
          <p className="mt-3 font-body text-base leading-relaxed text-cp-ink">
            {booking.clientNotes}
          </p>
        </RuledBox>
      )}

      {/* Facture PDF — uniquement quand le devis est posé. */}
      {hasQuote && (
        <aside className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-md border border-cp-cobalt bg-cp-cobalt p-5 text-cp-paper sm:p-6">
          <div>
            <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-canari">
              Facture du séjour
            </p>
            <p className="mt-1 font-display text-xl italic text-cp-paper">
              Téléchargez votre justificatif au format PDF.
            </p>
          </div>
          <a
            href={`/api/invoices/${booking.id}/pdf`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-md border border-cp-canari bg-cp-canari px-5 py-2.5 font-body text-sm font-semibold text-cp-ink transition-colors hover:bg-cp-canari-deep"
          >
            Télécharger la facture PDF ↓
          </a>
        </aside>
      )}

      {/* Carnet de séjour — masqué tant que le séjour n'est pas validé. */}
      {showJournal && (
        <>
          <RuleDivider className="my-16" label="Carnet de séjour" tone="cobalt" />
          <section aria-labelledby="journal-title" className="space-y-8">
            <SectionHeading
              number="01"
              title="Carnet de séjour"
              kicker="Une note photo quotidienne pendant que votre chat est avec nous."
              tone="cobalt"
            />

            <StayJournal bookingId={booking.id} />
          </section>
        </>
      )}

      <RuleDivider className="my-16" tone="paprika" />

      {/* Fil de discussion — POST réel sur /api/bookings/[id]/messages */}
      <section aria-labelledby="thread-title" className="space-y-8">
        <SectionHeading
          number={showJournal ? "02" : "01"}
          title="Échanges avec la maison"
          kicker={`${messages.length} message${messages.length > 1 ? "s" : ""} jusqu'ici.`}
          tone="paprika"
        />

        <ConversationView
          bookingId={booking.id}
          initialMessages={messages}
          voice="client"
        />
      </section>

      <RuleDivider className="my-16" />

      {/* Actions */}
      <footer className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/bookings"
          className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft hover:text-cp-paprika"
        >
          ← Retour aux séjours
        </Link>

        {["PENDING", "QUESTION_ASKED"].includes(booking.status) && (
          <CancelBookingButton bookingId={booking.id} />
        )}
      </footer>
    </article>
  );
}

function DetailTile({
  label,
  value,
  gloss,
}: {
  label: string;
  value: string;
  gloss: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-cp-ink bg-cp-paper p-6 sm:p-8">
      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
        {label}
      </p>
      <p className="font-display text-4xl font-bold leading-none tracking-tight text-cp-ink sm:text-5xl">
        {value}
      </p>
      <p className="font-body text-sm text-cp-ink-soft">{gloss}</p>
    </div>
  );
}
