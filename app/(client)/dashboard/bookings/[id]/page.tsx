import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CancelBookingButton } from "@/components/cancel-booking-button";
import { ConversationView } from "@/components/conversation-view";
import { LibraryStamp } from "@/components/library-stamp";
import { RdvJoinButton } from "@/components/rdv-join-button";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { StayJournal } from "@/components/stay-journal";
import { StaySchedule } from "@/components/stay-schedule";
import { resolveTab, UrlTabs, type UrlTabItem } from "@/components/url-tabs";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { CAT_REVIEW_BADGE, CAT_REVIEW_LABEL } from "@/lib/cat-review";
import { readSettings } from "@/lib/repository";
import { extraUnitGloss } from "@/lib/extras";
import {
  ageLabel,
  displayRef,
  formatDate,
  formatDateTime,
  formatEuros,
  getAppointmentsForBooking,
  getBookingFor,
  nightsBetween,
} from "@/lib/repository";

/// Détail d'un séjour côté client — lecture Prisma avec auth check, fil
/// de discussion qui POST réellement, annulation qui PATCH le statut.

/// « Nouvelles » plutôt qu'« Administratif » : cette page s'adresse au
/// propriétaire du chat, pas à un service.
const TABS: UrlTabItem<"sejour" | "nouvelles">[] = [
  { value: "sejour", label: "Mon séjour" },
  { value: "nouvelles", label: "Nouvelles" },
];

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { id } = await params;
  const onglet = resolveTab((await searchParams).onglet, TABS);
  const user = await getCurrentUser();
  if (!user) return null;

  const booking = await getBookingFor(id, user.id, isAdmin(user));
  if (!booking) notFound();

  const appointments = await getAppointmentsForBooking(booking.id);
  const settings = await readSettings();
  const arrivalWindow = {
    start: settings.arrival_window_start,
    end: settings.arrival_window_end,
  };
  const departureWindow = {
    start: settings.departure_window_start,
    end: settings.departure_window_end,
  };
  const cats = booking.cats.map((link) => link.cat);
  const nights = nightsBetween(booking.startDate, booking.endDate);
  const ref = displayRef(booking.id);
  const extrasTotal = booking.extras.reduce(
    (sum, extra) => sum + (extra.amount === null ? 0 : Number(extra.amount)),
    0,
  );

  // Le devis est posé par la maison lors du passage à ACCEPTED. Tant que
  // PENDING ou QUESTION_ASKED, on cache les chiffres et la facture PDF.
  const awaitingQuote = ["PENDING", "QUESTION_ASKED"].includes(booking.status);
  const hasQuote = !awaitingQuote && booking.totalAmount !== null;
  // Le carnet de séjour n'a de sens qu'une fois le séjour validé : on le
  // cache tant que la demande n'est pas acceptée (ou terminée).
  const showJournal = ["ACCEPTED", "COMPLETED"].includes(booking.status);
  // Séjour clôturé : le fil passe en lecture seule, comme côté admin, pour ne
  // pas laisser le client écrire à une pension qui ne peut plus lui répondre.
  // « Refusé » en est exclu : l'échange continue après un refus.
  const isClosed = ["CANCELLED", "COMPLETED"].includes(booking.status);
  // La facture n'est servie au client que sur un séjour accepté ou terminé,
  // cf. app/api/invoices/[bookingId]/pdf/route.tsx.
  const canDownloadInvoice =
    hasQuote && ["ACCEPTED", "COMPLETED"].includes(booking.status);

  // Mappe les messages Prisma vers le format attendu par ConversationView.
  const messages = booking.messages.map((m) => ({
    id: m.id,
    body: m.content,
    fromAdmin: m.isFromAdmin,
    authorLabel: m.isFromAdmin
      ? "Nous"
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
        <span className="text-cp-ink">N°{ref}</span>
      </nav>

      {/* En-tête éditoriale */}
      <header className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <LibraryStamp boxed>
            Séjour N°{ref}, {nights} nuit{nights > 1 ? "s" : ""}
          </LibraryStamp>
          <BookingStatusBadge status={booking.status} />
        </div>

        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Du {formatDate(booking.startDate)}
          <br />
          <span className="italic font-normal">au {formatDate(booking.endDate)}.</span>
        </h1>

        {/* Le client voit la même chose que la pension : soit l'heure convenue
            avec lui, soit le créneau d'accueil habituel. Il n'a rien à choisir
            ni à demander. */}
        <StaySchedule
          schedule={{
            arrivalTime: booking.arrivalTime,
            departureTime: booking.departureTime,
            arrivalWindow,
            departureWindow,
          }}
        />

        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          {cats.map((c) => c.name).join(" · ")}, {nights} nuit
          {nights > 1 ? "s" : ""} pour {cats.length} pensionnaire
          {cats.length > 1 ? "s" : ""}.
        </p>
      </header>

      <UrlTabs
        items={TABS}
        active={onglet}
        basePath={`/dashboard/bookings/${booking.id}`}
        ariaLabel="Sections de votre séjour"
        className="mt-10"
      />

      <RuleDivider className="my-12" />

      {/* Le contenu des deux onglets garde son indentation d'origine : le
          décaler aurait produit un diff presque entièrement blanc, qui aurait
          masqué les vraies modifications. */}
      {onglet === "sejour" && (
        <>
      {awaitingQuote ? (
        <>
          <aside className="rounded-md border border-cp-cobalt bg-cp-paper-deep p-6 sm:p-8">
            <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-cobalt">
              Devis en cours d&apos;évaluation
            </p>
            <p className="mt-3 font-display text-2xl italic leading-snug text-cp-ink sm:text-3xl">
              Nous étudions votre demande et vous reviendrons avec un tarif
              personnalisé sous 48 h.
            </p>
            <p className="mt-3 font-body text-sm text-cp-ink-soft">
              Les nuitées, l&apos;éventuel coût de soins ou nourriture
              particulière et l&apos;acompte vous seront communiqués ici dès
              que le devis sera prêt.
            </p>
          </aside>

          {/* Encadré neutre et non cobalt : il suit immédiatement l'aside
              cobalt du devis, et deux cadres bleus qui s'enchaînent alourdissent
              la page sans rien hiérarchiser. Le cobalt reste comme accent, sur
              le titre et les montants. */}
          {booking.extras.length > 0 && (
            <RuledBox className="mt-6">
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
                        : `~ ${formatEuros(Number(extra.amount))}€`}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-body text-xs italic text-cp-ink-soft">
                Tarifs indicatifs, nous les confirmons dans le devis final.
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
                value={`${formatEuros(Number(booking.totalAmount))}€`}
                gloss={totalGloss(
                  Number(booking.pricePerFirstCat),
                  Number(booking.pricePerExtraCat),
                  cats.length,
                  nights,
                  extrasTotal,
                )}
              />
              <DetailTile
                label="Pensionnaires"
                value={cats.length.toString().padStart(2, "0")}
                gloss={cats.map((c) => c.name).join(" · ")}
              />
              <DetailTile
                label="Acompte"
                value={`${formatEuros(Number(booking.depositAmount))}€`}
                gloss={`${booking.depositPercentage} % à la réservation`}
              />
            </section>

            {/* Même traitement que « Suppléments souhaités » plus haut : les
                deux blocs étaient construits pareil, ils doivent le rester. */}
            {booking.extras.length > 0 && (
              <RuledBox className="mt-6">
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
                          : `+${formatEuros(Number(extra.amount))}€`}
                      </span>
                    </li>
                  ))}
                </ul>
              </RuledBox>
            )}
          </>
        )
      )}

      {/* Pensionnaires + avis de la maison (validé / réserve / refusé + note) */}
      <section className="mt-12 space-y-6">
        <SectionHeading
          number="01"
          title="Pensionnaires"
          kicker="Notre avis sur chaque chat apparaît ici une fois la fiche étudiée."
          tone="cobalt"
        />
        <ul className="flex flex-wrap gap-px self-start overflow-hidden rounded-md border border-cp-ink bg-cp-ink [&>li]:grow [&>li]:basis-full [&>li]:bg-cp-paper sm:[&>li]:basis-[calc(50%-1px)]">
          {booking.cats.map((link) => (
            <li key={link.cat.id} className="flex flex-col gap-3 bg-cp-paper p-5">
              <header className="flex items-baseline justify-between gap-3">
                <p className="font-display text-2xl italic leading-tight text-cp-ink">
                  {link.cat.name}
                </p>
                <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cp-paprika">
                  N°{displayRef(link.cat.id)}
                </p>
              </header>
              <p className="font-body text-sm text-cp-ink-soft">
                {link.cat.breed ?? "sans race"} · {ageLabel(link.cat.birthDate)}
              </p>
              <div className="border-t border-cp-ink/20 pt-3">
                {link.reviewStatus === "PENDING" ? (
                  <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-mute">
                    En cours d&apos;évaluation
                  </p>
                ) : (
                  <div className="space-y-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] ${CAT_REVIEW_BADGE[link.reviewStatus]}`}
                    >
                      {CAT_REVIEW_LABEL[link.reviewStatus]}
                    </span>
                    {link.reviewNote && (
                      <p className="font-body text-sm leading-relaxed text-cp-ink">
                        {link.reviewNote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

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

      {/* Facture PDF — la route ne la sert au client que sur un séjour accepté
          ou terminé. Ne proposons pas un bouton qu'elle refusera : sur un
          séjour annulé déjà chiffré, il renvoyait du JSON brut dans un
          onglet vide. */}
      {canDownloadInvoice && (
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

        </>
      )}

      {onglet === "nouvelles" && (
        <>
      {/* Carnet de séjour — masqué tant que le séjour n'est pas validé. */}
      {showJournal && (
        <>
          <RuleDivider className="my-16" label="Carnet de séjour" tone="cobalt" />
          <section aria-labelledby="journal-title" className="space-y-8">
            <SectionHeading
              number="02"
              title="Carnet de séjour"
              kicker="Une note photo quotidienne pendant que votre chat est avec nous."
              tone="cobalt"
            />

            <StayJournal bookingId={booking.id} />
          </section>
        </>
      )}

      {appointments.length > 0 && (
        <>
          <RuleDivider className="my-16" label="Télé-rendez-vous" tone="feuille" />
          <section className="space-y-4">
            <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
              Nous vous proposons un appel vidéo. Rejoignez-le à l&apos;heure
              dite depuis cette page.
            </p>
            <ul className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink">
              {appointments.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 bg-cp-paper p-4"
                >
                  <div>
                    <p className="font-display text-lg italic leading-tight text-cp-ink">
                      {formatDateTime(a.scheduledAt)}
                    </p>
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
                      {a.durationMin} min{a.title ? ` · ${a.title}` : ""}
                    </p>
                  </div>
                  {a.status === "SCHEDULED" ? (
                    <RdvJoinButton
                      href={`/dashboard/rdv/${a.id}`}
                      scheduledAt={a.scheduledAt.toISOString()}
                      durationMin={a.durationMin}
                    />
                  ) : (
                    <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-mute">
                      {a.status === "CANCELLED" ? "Annulé" : "Terminé"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <RuleDivider className="my-16" tone="paprika" />

      {/* Fil de discussion — POST réel sur /api/bookings/[id]/messages */}
      <section aria-labelledby="thread-title" className="space-y-8">
        <SectionHeading
          number={showJournal ? "03" : "02"}
          title="Échanges avec nous"
          kicker={`${messages.length} message${messages.length > 1 ? "s" : ""} jusqu'ici.`}
          tone="paprika"
        />

        <ConversationView
          bookingId={booking.id}
          initialMessages={messages}
          voice="client"
          readOnly={isClosed}
        />
      </section>
        </>
      )}

      <RuleDivider className="my-16" />

      {/* Actions */}
      <footer className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/bookings"
          className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft hover:text-cp-paprika"
        >
          ← Retour aux séjours
        </Link>

        {["PENDING", "QUESTION_ASKED"].includes(booking.status) ? (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/dashboard/bookings/${booking.id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Modifier la demande
            </Link>
            <CancelBookingButton bookingId={booking.id} />
          </div>
        ) : booking.status === "ACCEPTED" ? (
          <p className="font-body text-sm text-cp-ink-soft">
            Pour annuler un séjour accepté, contactez-nous.
          </p>
        ) : null}
      </footer>
    </article>
  );
}

/// Décompte lisible du « Tarif total » : séjour (nuitées) + suppléments,
/// sans faire apparaître le dégressif quand il n'y a qu'un chat.
function totalGloss(
  pricePerFirstCat: number,
  pricePerExtraCat: number,
  catCount: number,
  nights: number,
  extrasTotal: number,
): string {
  const fmt = formatEuros;
  const nightly = pricePerFirstCat + pricePerExtraCat * (catCount - 1);
  const stay = nightly * nights;
  const nightlyLabel =
    catCount > 1
      ? `${fmt(pricePerFirstCat)}€ + ${fmt(pricePerExtraCat)}€ × ${catCount - 1} par nuit`
      : `${fmt(pricePerFirstCat)}€ par nuit`;
  const stayPart = `Séjour ${fmt(stay)}€ (${nightlyLabel} × ${nights} nuit${nights > 1 ? "s" : ""})`;
  return extrasTotal > 0
    ? `${stayPart} + suppléments ${fmt(extrasTotal)}€`
    : stayPart;
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
