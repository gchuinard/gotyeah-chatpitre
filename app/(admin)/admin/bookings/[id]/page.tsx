import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { LibraryStamp } from "@/components/library-stamp";
import { MessageThread } from "@/components/message-thread";
import { StayJournal } from "@/components/stay-journal";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getBooking, getCat, getClient } from "@/lib/fixtures";

/// Détail admin d'un séjour : récap + infos client + fil + actions de
/// changement de statut (Accepter / Poser une question / Refuser). Pour
/// l'instant les boutons sont des soumissions GET vers la liste (no-op).

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = getBooking(id);
  if (!booking) notFound();

  const client = getClient(booking.ownerId);
  const cats = booking.catIds
    .map((catId) => getCat(catId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

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
        <span className="text-cp-ink">N° {booking.reference}</span>
      </nav>

      <header className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <LibraryStamp boxed>
            Séjour N° {booking.reference} — {booking.nights} nuit{booking.nights > 1 ? "s" : ""}
          </LibraryStamp>
          <BookingStatusBadge status={booking.status} />
        </div>

        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Du {booking.startDate}
          <br />
          <span className="italic font-normal">au {booking.endDate}.</span>
        </h1>

        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          {cats.map((c) => c.name).join(" · ")} — confiés par{" "}
          {client ? `${client.firstName} ${client.lastName}` : "—"}.
        </p>
      </header>

      <RuleDivider className="my-12" />

      {/* Récap client + tarif */}
      <section className="grid gap-px overflow-hidden border border-cp-ink bg-cp-ink lg:grid-cols-3">
        <DetailTile label="Client">
          <p className="font-display text-2xl italic leading-tight text-cp-ink">
            {client ? `${client.firstName} ${client.lastName}` : "—"}
          </p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
            {client?.email}
            {client?.phone && (
              <>
                <br />
                {client.phone}
              </>
            )}
          </p>
        </DetailTile>
        <DetailTile label="Tarif total">
          <p className="font-display text-4xl font-bold leading-none text-cp-ink sm:text-5xl">
            {booking.total}€
          </p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
            {booking.pricePerNight}€ × {booking.nights} nuits
          </p>
        </DetailTile>
        <DetailTile label="Acompte 30 %">
          <p className="font-display text-4xl font-bold leading-none text-cp-ink sm:text-5xl">
            {Math.round(booking.total * 0.3)}€
          </p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
            À encaisser à la réservation
          </p>
        </DetailTile>
      </section>

      {/* Pensionnaires détaillés */}
      <section className="mt-10 space-y-6">
        <SectionHeading
          number="01"
          title="Pensionnaires concernés"
          kicker={`${cats.length} fiche${cats.length > 1 ? "s" : ""} à valider avant l'arrivée.`}
        />
        <ul className="grid gap-px overflow-hidden border border-cp-ink bg-cp-ink sm:grid-cols-2">
          {cats.map((cat) => (
            <li
              key={cat.id}
              className="flex flex-col gap-3 bg-cp-paper p-5"
            >
              <header className="flex items-baseline justify-between gap-3">
                <p className="font-display text-2xl italic leading-tight text-cp-ink">
                  {cat.name}
                </p>
                <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cp-paprika">
                  N° {cat.reference}
                </p>
              </header>
              <p className="font-body text-sm text-cp-ink-soft">
                {cat.breed} · {cat.ageLabel}
              </p>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-cp-ink/30 pt-3 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em]">
                <Criterion ok={cat.criteria.sterilized} label="Stérilisé" />
                <Criterion ok={cat.criteria.identified} label="Identifié" />
                <Criterion ok={cat.criteria.vaccines} label="Vaccins" />
                <Criterion ok={cat.criteria.sociable} label="Sociable" />
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {booking.notes && (
        <RuledBox variant="deep" className="mt-10">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
            Note du client
          </p>
          <p className="mt-3 font-body text-base leading-relaxed text-cp-ink">
            {booking.notes}
          </p>
        </RuledBox>
      )}

      {/* Actions de statut */}
      {["PENDING", "QUESTION_ASKED"].includes(booking.status) && (
        <section className="mt-14 border border-cp-ink bg-cp-paper-deep/60 p-6 sm:p-8">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
            Décision à prendre
          </p>
          <p className="mt-3 font-display text-2xl italic leading-snug text-cp-ink sm:text-3xl">
            Quelle suite donnez-vous ?
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <form action="/admin/bookings" method="get">
              <Button type="submit" size="default">
                Accepter →
              </Button>
            </form>
            <form action="/admin/bookings" method="get">
              <Button type="submit" variant="secondary" size="default">
                Poser une question
              </Button>
            </form>
            <form action="/admin/bookings" method="get">
              <Button type="submit" variant="destructive" size="default">
                Refuser
              </Button>
            </form>
          </div>
        </section>
      )}

      <RuleDivider className="my-16" label="Carnet de séjour" tone="cobalt" />

      {/* Carnet de séjour — admin peut poster des entrées */}
      <section aria-labelledby="journal-title" className="space-y-8">
        <SectionHeading
          number="02"
          title="Carnet de séjour"
          kicker="Une note photo quotidienne — c'est ce que voit le client."
          tone="cobalt"
        />

        <StayJournal bookingId={booking.id} canAdd />
      </section>

      <RuleDivider className="my-16" label="Fil de discussion" tone="paprika" />

      {/* Fil */}
      <section aria-labelledby="thread-title" className="space-y-8">
        <SectionHeading
          number="03"
          title="Échanges avec le client"
          kicker={`${booking.messages.length} message${booking.messages.length > 1 ? "s" : ""} échangé${booking.messages.length > 1 ? "s" : ""} jusqu'ici.`}
          tone="paprika"
        />

        <MessageThread messages={booking.messages} />

        {/* Formulaire admin */}
        <form
          action="/admin/bookings"
          method="get"
          className="space-y-4 border border-cp-ink bg-cp-ink p-6 text-cp-paper sm:p-8"
        >
          <label
            htmlFor="admin-reply"
            className="block font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paper/70"
          >
            Réponse de la maison
          </label>
          <Textarea
            id="admin-reply"
            name="body"
            rows={4}
            placeholder="Écrivez votre réponse au client…"
            className="border-cp-paper/40 bg-cp-ink text-cp-paper placeholder:text-cp-paper/50 focus-visible:outline-cp-paper"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="default"
              variant="secondary"
              className="border-cp-paper text-cp-paper bg-transparent hover:bg-cp-paper hover:text-cp-ink"
            >
              Envoyer →
            </Button>
          </div>
        </form>
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
    <div className="flex flex-col gap-2 bg-cp-paper p-6 sm:p-8">
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
