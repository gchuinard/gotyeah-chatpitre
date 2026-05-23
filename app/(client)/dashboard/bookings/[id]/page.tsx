import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { LibraryStamp } from "@/components/library-stamp";
import { MessageThread } from "@/components/message-thread";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getBooking, getCat } from "@/lib/fixtures";

/// Détail d'un séjour : récapitulatif tarif/dates/pensionnaires, fil de
/// discussion, formulaire de nouveau message (maquette, action GET).

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = getBooking(id);
  if (!booking) notFound();

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
        <Link href="/dashboard" className="hover:text-cp-sanguine">
          Mon espace
        </Link>
        <span aria-hidden>/</span>
        <Link href="/dashboard/bookings" className="hover:text-cp-sanguine">
          Séjours
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">N° {booking.reference}</span>
      </nav>

      {/* En-tête éditoriale */}
      <header className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <LibraryStamp boxed>
            § Séjour N° {booking.reference} — {booking.nights} nuit{booking.nights > 1 ? "s" : ""}
          </LibraryStamp>
          <BookingStatusBadge status={booking.status} />
        </div>

        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Du {booking.startDate}
          <br />
          <span className="italic font-normal">au {booking.endDate}.</span>
        </h1>

        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          {cats.map((c) => c.name).join(" · ")} —{" "}
          {booking.nights} nuit{booking.nights > 1 ? "s" : ""} pour{" "}
          {cats.length} pensionnaire{cats.length > 1 ? "s" : ""}.
        </p>
      </header>

      <RuleDivider weight="heavy" className="my-12" />

      {/* Récap chiffres + cats + note */}
      <section className="grid gap-px overflow-hidden border border-cp-ink bg-cp-ink lg:grid-cols-3">
        <DetailTile label="Tarif total" value={`${booking.total}€`} gloss={`${booking.pricePerNight}€ × ${booking.nights} nuits`} />
        <DetailTile
          label="Pensionnaires"
          value={cats.length.toString().padStart(2, "0")}
          gloss={cats.map((c) => c.name).join(" · ")}
        />
        <DetailTile
          label="Acompte"
          value={`${Math.round(booking.total * 0.3)}€`}
          gloss="30 % à la réservation"
        />
      </section>

      {booking.notes && (
        <RuledBox variant="deep" className="mt-10">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-sanguine">
            § note de séjour
          </p>
          <p className="mt-3 font-body text-base leading-relaxed text-cp-ink">
            {booking.notes}
          </p>
        </RuledBox>
      )}

      <RuleDivider className="my-16" label="Fil de discussion" weight="heavy" />

      {/* Fil de discussion */}
      <section aria-labelledby="thread-title" className="space-y-8">
        <SectionHeading
          number="01"
          title="Échanges avec la maison"
          kicker={`${booking.messages.length} message${booking.messages.length > 1 ? "s" : ""} jusqu'ici.`}
        />

        <MessageThread messages={booking.messages} />

        {/* Formulaire nouveau message — maquette */}
        <form
          action="/dashboard/bookings"
          method="get"
          className="space-y-4 border border-cp-ink bg-cp-paper p-6 sm:p-8"
        >
          <label
            htmlFor="reply-body"
            className="block font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-sanguine"
          >
            § Nouveau message
          </label>
          <Textarea
            id="reply-body"
            name="body"
            rows={4}
            placeholder="Écrivez votre réponse à la maison…"
          />
          <div className="flex justify-end">
            <Button type="submit" size="default">
              Envoyer →
            </Button>
          </div>
        </form>
      </section>

      <RuleDivider weight="heavy" className="my-16" />

      {/* Actions */}
      <footer className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/bookings"
          className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft hover:text-cp-sanguine"
        >
          ← Retour aux séjours
        </Link>

        {["PENDING", "QUESTION_ASKED"].includes(booking.status) && (
          <Link
            href="/dashboard/bookings"
            className={buttonVariants({
              variant: "destructive",
              size: "sm",
            })}
          >
            Annuler la demande
          </Link>
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
    <div className="flex flex-col gap-1 bg-cp-paper p-6 sm:p-8">
      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-sanguine">
        {label}
      </p>
      <p className="font-display text-4xl font-bold leading-none tracking-tight text-cp-ink sm:text-5xl">
        {value}
      </p>
      <p className="font-body text-sm text-cp-ink-soft">{gloss}</p>
    </div>
  );
}
