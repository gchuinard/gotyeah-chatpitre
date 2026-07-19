import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingClosureControl } from "@/components/booking-closure-control";
import { BookingPayments } from "@/components/booking-payments";
import { BookingTaskControl } from "@/components/booking-task-control";
import { MarkMessagesRead } from "@/components/mark-messages-read";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CatReviewControl } from "@/components/cat-review-control";
import { ConversationView } from "@/components/conversation-view";
import { LibraryStamp } from "@/components/library-stamp";
import { QuoteForm } from "@/components/quote-form";
import { RdvScheduler } from "@/components/rdv-scheduler";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { StayJournal } from "@/components/stay-journal";
import { buttonVariants } from "@/components/ui/button";
import { resolveTab, UrlTabs, type UrlTabItem } from "@/components/url-tabs";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeBookingPricing } from "@/lib/pricing";
import {
  ageLabel,
  displayRef,
  formatDate,
  getAppointmentsForBooking,
  getBookingFor,
  getPaymentsForBooking,
  nightsBetween,
  todayInputDate,
  toInputDate,
} from "@/lib/repository";

/// Détail admin d'un séjour — Prisma + actions de changement de statut
/// PATCH + ConversationView qui POST réellement + carnet wired.

/// Vrai si une édition client a été signalée récemment (fenêtre de fraîcheur
/// de 15 min), pour n'afficher l'avertissement que tant qu'il est pertinent.
function isEditingRecent(startedAt: Date | null): boolean {
  if (!startedAt) return false;
  return Date.now() - startedAt.getTime() < 15 * 60_000;
}

/// Vrai une fois la date d'arrivée atteinte. Comme isEditingRecent, la lecture
/// de l'heure courante vit dans une fonction à part : le rendu d'un composant
/// doit rester pur, et le lint React le vérifie.
function hasBookingStarted(startDate: Date): boolean {
  return startDate.getTime() <= Date.now();
}

/// Les pensionnaires restent hors onglets, sur la page : c'est ce qu'on
/// consulte le plus souvent, ça ne doit coûter aucun clic. Seules les deux
/// zones lourdes se rangent.
// Contact client en PREMIER, donc par défaut : c'est l'onglet le plus consulté,
// il ne doit pas coûter un clic à chaque ouverture de fiche.
const TABS: UrlTabItem<"contact" | "administratif">[] = [
  { value: "contact", label: "Contact client" },
  { value: "administratif", label: "Administratif" },
];

export default async function AdminBookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { id } = await params;
  const onglet = resolveTab((await searchParams).onglet, TABS);
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) return null;

  const booking = await getBookingFor(id, user.id, true);
  if (!booking) notFound();

  const appointments = await getAppointmentsForBooking(booking.id);
  // Dates formatées côté serveur : le composant est un composant client, et un
  // formatage fait des deux côtés doit produire exactement la même chaîne.
  const paymentRows = (await getPaymentsForBooking(booking.id)).map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    method: p.method,
    paidAtLabel: formatDate(p.paidAt),
    paidAtInput: toInputDate(p.paidAt),
    reference: p.reference,
    recordedByLabel: p.recordedBy?.firstName ?? null,
  }));
  const cats = booking.cats.map((link) => link.cat);
  const client = booking.user;
  const nights = nightsBetween(booking.startDate, booking.endDate);
  const ref = displayRef(booking.id);
  const awaitingQuote = ["PENDING", "QUESTION_ASKED"].includes(booking.status);
  const hasQuote = booking.totalAmount !== null;
  // Séjour clôturé (annulé ou terminé) : la fiche passe en lecture seule. On
  // grise et neutralise les contrôles admin, et le fil d'échanges ne permet
  // plus d'écrire. Seule exception, l'encaissement d'un séjour TERMINÉ reste
  // modifiable : le solde peut être réglé après le départ des chats, et rien
  // dans l'interface ne permettrait de rouvrir le séjour pour le saisir.
  const isCancelled = booking.status === "CANCELLED";
  const isClosed = isCancelled || booking.status === "COMPLETED";
  // Le carnet de séjour n'a de sens qu'une fois le séjour validé : masqué tant
  // que la demande n'est pas acceptée (ou terminée).
  // …et une fois le séjour COMMENCÉ : avant l'arrivée des chats, le carnet
  // s'affichait parfois des semaines à l'avance alors qu'il n'y a rien à
  // raconter.
  const showJournal =
    hasBookingStarted(booking.startDate) &&
    ["ACCEPTED", "COMPLETED"].includes(booking.status);
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

  // Un message du client non lu garde le séjour dans la file « À traiter ».
  // L'ouverture de cette fiche le marque lu, mais depuis le NAVIGATEUR : Next
  // précharge les liens, et le faire ici viderait la file au simple survol.
  const hasUnreadFromClient = booking.messages.some(
    (m) => !m.isFromAdmin && m.readAt === null,
  );

  const messages = booking.messages.map((m) => ({
    id: m.id,
    body: m.content,
    fromAdmin: m.isFromAdmin,
    authorLabel: m.isFromAdmin
      ? "Nous"
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
        <span className="text-cp-ink">N°{ref}</span>
      </nav>

      {/* Retour direct en haut de page : le fil d'Ariane seul est trop discret
          quand la fiche est longue. */}
      <Link
        href="/admin/bookings"
        className={buttonVariants({ variant: "outline", className: "mb-6" })}
      >
        ← Retour à la liste des séjours
      </Link>

      <header className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <LibraryStamp boxed>
            Séjour N°{ref}, {nights} nuit{nights > 1 ? "s" : ""}
          </LibraryStamp>
          <BookingStatusBadge status={booking.status} />
        </div>

        <MarkMessagesRead bookingId={booking.id} hasUnread={hasUnreadFromClient} />

        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Du {formatDate(booking.startDate)}
          <br />
          <span className="italic font-normal">au {formatDate(booking.endDate)}.</span>
        </h1>

        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          {cats.map((c) => c.name).join(" · ")}, confiés par{" "}
          {client.firstName} {client.lastName}.
        </p>
      </header>

      {isEditingRecent(booking.editingStartedAt) && (
        <aside className="mt-6 rounded-md border border-cp-paprika bg-cp-paprika-light/40 px-4 py-3 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-paprika">
          Modification en cours par le client, la demande peut encore changer.
        </aside>
      )}

      {booking.interviewRequested && (
        <aside className="mt-6 rounded-md border border-cp-cobalt bg-cp-cobalt-light/30 p-5">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-cobalt">
            Entretien demandé ·{" "}
            {booking.interviewChannel === "PHONE" ? "Téléphone" : "Visio"}
          </p>
          <p className="mt-2 font-body text-sm text-cp-ink">
            {booking.interviewTopic
              ? booking.interviewTopic
              : "Le client souhaite un échange avant le séjour. Recontactez-le pour caler un créneau."}
          </p>
        </aside>
      )}

      {isClosed && (
        <aside className="mt-6 rounded-md border border-cp-ink/30 bg-cp-paper-deep px-4 py-3">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
            {isCancelled ? "Séjour annulé" : "Séjour terminé"}
          </p>
          <p className="mt-1 font-body text-sm text-cp-ink-soft">
            {isCancelled
              ? "Cette demande a été annulée par le client. La fiche est en lecture seule, aucune action n'est plus possible."
              : "Ce séjour est terminé. La fiche est en lecture seule, seul l'encaissement reste modifiable."}
          </p>
          {/* Hors ActionGate, et c'est voulu : ce bandeau reste sur la page
              principale, donc le seul contrôle qui doit rester actif sur une
              fiche verrouillée y est naturellement à sa place. */}
          <div className="mt-4">
            <BookingClosureControl bookingId={booking.id} mode="reopen" />
          </div>
        </aside>
      )}

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
                {link.cat.breed} · {ageLabel(link.cat.birthDate)}
              </p>
              <Link
                href={`/admin/cats/${link.cat.id}`}
                className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-cobalt hover:text-cp-paprika"
              >
                Fiche &amp; documents →
              </Link>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-cp-ink/30 pt-3 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em]">
                <Criterion ok={link.cat.isSterilized} label="Stérilisé" />
                <Criterion ok={link.cat.isIdentified} label="Identifié" />
                <Criterion ok={link.cat.vaccinesUpToDate} label="Vaccins" />
                <Criterion ok={link.cat.isSociable} label="Sociable" />
              </ul>
              <ActionGate disabled={isClosed}>
                <CatReviewControl
                  bookingId={booking.id}
                  catId={link.cat.id}
                  initialStatus={link.reviewStatus}
                  initialNote={link.reviewNote}
                />
              </ActionGate>
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

      <UrlTabs
        items={TABS}
        active={onglet}
        basePath={`/admin/bookings/${booking.id}`}
        ariaLabel="Sections du séjour"
        className="mt-14"
      />

      {onglet === "administratif" && (
        <>
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

          {/* Encaissement — montant réellement payé (distinct du total facturé). */}
          {hasQuote && (
            <section className="mt-6 rounded-md border border-cp-ink bg-cp-paper p-5 sm:p-6">
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
                Encaissement
              </p>
              <p className="mb-3 mt-1 font-body text-sm text-cp-ink-soft">
                Ce qui a réellement été payé pour ce séjour (distinct du total facturé).
              </p>
              {/* Verrouillé sur un séjour annulé seulement : sur un séjour terminé,
                  le solde peut encore être encaissé après le départ des chats. */}
              <ActionGate disabled={isCancelled}>
                <BookingPayments
                  bookingId={booking.id}
                  total={Number(booking.totalAmount)}
                  payments={paymentRows}
                  today={todayInputDate()}
                />
              </ActionGate>
            </section>
          )}

          {!hasQuote && !awaitingQuote && (
            <p className="mt-10 font-display text-xl italic text-cp-ink-soft">
              Aucun devis n&apos;a été posé sur ce séjour, il n&apos;y a rien à
              facturer.
            </p>
          )}

          {/* Clôture — seulement depuis « accepté », en miroir de la garde
              serveur. Les chats sont repartis, on solde le séjour. */}
          {booking.status === "ACCEPTED" && (
            <section className="mt-6 rounded-md border border-cp-ink/30 bg-cp-paper-deep p-5 sm:p-6">
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft">
                Fin du séjour
              </p>
              <p className="mb-4 mt-1 font-body text-sm text-cp-ink-soft">
                Une fois les chats repartis, marquez le séjour comme terminé pour
                figer sa fiche et envoyer au client sa facture et son carnet.
              </p>
              <BookingClosureControl bookingId={booking.id} mode="complete" />
            </section>
          )}

          {/* Devis + actions — uniquement tant que PENDING ou QUESTION_ASKED. */}
          {awaitingQuote && suggested && (
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
          )}
        </>
      )}

      {onglet === "contact" && (
        <>
          {/* Carnet de séjour — masqué tant que le séjour n'est pas validé ET
              pas commencé : avant l'arrivée des chats, il n'y a rien à
              raconter. */}
          {showJournal && (
            <section aria-labelledby="journal-title" className="mt-12 space-y-8">
              <SectionHeading
                title="Carnet de séjour"
                kicker="Une note photo quotidienne, c'est ce que voit le client."
                tone="cobalt"
              />

              <StayJournal bookingId={booking.id} cats={cats} canAdd={!isClosed} />
            </section>
          )}

          {/* Télé-rendez-vous */}
          <RuleDivider className="my-16" label="Télé-rendez-vous" tone="feuille" />
          <ActionGate disabled={isClosed}>
            <RdvScheduler
              bookingId={booking.id}
              appointments={appointments.map((a) => ({
                id: a.id,
                scheduledAt: a.scheduledAt.toISOString(),
                durationMin: a.durationMin,
                status: a.status,
                title: a.title,
              }))}
            />
          </ActionGate>

          <RuleDivider className="my-16" tone="paprika" />

          {/* Fil — POST réel */}
          <section aria-labelledby="thread-title" className="space-y-8">
            <SectionHeading
              title="Échanges avec le client"
              kicker={`${messages.length} message${messages.length > 1 ? "s" : ""} échangé${messages.length > 1 ? "s" : ""} jusqu'ici.`}
              tone="paprika"
            />

            {/* Au niveau du fil, et non dans l'en-tête : neuf fois sur dix la
                tâche naît de ce qu'on vient de lire ici, et on la note dans la
                foulée sans remonter la page. */}
            <BookingTaskControl
              bookingId={booking.id}
              active={booking.pinnedForAdmin}
              note={booking.pinnedNote}
            />

            <ConversationView
              bookingId={booking.id}
              initialMessages={messages}
              voice="admin"
              canRespond={awaitingQuote}
              readOnly={isClosed}
            />
          </section>
        </>
      )}

      <RuleDivider className="my-16" />

      <footer>
        <Link
          href="/admin/bookings"
          className={buttonVariants({ variant: "outline" })}
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

/// Neutralise une zone d'actions admin (grisée + non interactive) quand le
/// séjour est clôturé. `inert` coupe clic ET focus clavier sur tout le sous-arbre.
function ActionGate({
  disabled,
  children,
}: {
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      inert={disabled}
      aria-disabled={disabled || undefined}
      className={
        disabled ? "pointer-events-none opacity-50 select-none" : undefined
      }
    >
      {children}
    </div>
  );
}
