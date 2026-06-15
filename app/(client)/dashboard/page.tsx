import Link from "next/link";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CatCard } from "@/components/cat-card";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import {
  displayRef,
  formatDate,
  getBookingsByOwner,
  getCatsByOwner,
  getNextBookingFor,
  nightsBetween,
  toCatCardProps,
} from "@/lib/repository";

/// Mon espace — tableau de bord client, lit Prisma via lib/repository.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  // Le proxy garantit la session ; ce fallback contente TypeScript.
  if (!user) return null;
  const firstName = user.firstName;

  const [cats, bookings, upcoming] = await Promise.all([
    getCatsByOwner(user.id),
    getBookingsByOwner(user.id),
    getNextBookingFor(user.id),
  ]);

  const pastCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const activeCount = bookings.filter((b) =>
    ["PENDING", "QUESTION_ASKED", "ACCEPTED"].includes(b.status),
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      {/* En-tête éditoriale */}
      <header className="space-y-5">
        <LibraryStamp tone="cobalt" boxed>
          Mon espace · {firstName}
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl lg:text-7xl">
          Bonjour, {firstName}.
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft sm:text-2xl">
          {cats.length === 0
            ? "Aucun pensionnaire enregistré. Commencez par déclarer votre première fiche féline."
            : upcoming
              ? `Prochain séjour le ${formatDate(upcoming.startDate)}. ${cats.length} pensionnaire${cats.length > 1 ? "s" : ""} dans votre troupe.`
              : "Pas de séjour en cours. Tout va bien."}
        </p>
      </header>

      <RuleDivider className="my-14" tone="cobalt" />

      {/* Stats compactes */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Pensionnaires"
          value={cats.length.toString().padStart(2, "0")}
          gloss={cats.map((c) => c.name).join(" · ") || "Aucun"}
        />
        <StatTile
          label="Séjours à venir"
          value={activeCount.toString().padStart(2, "0")}
          gloss={upcoming ? `Prochain le ${formatDate(upcoming.startDate)}` : "Aucun planifié"}
        />
        <StatTile
          label="Séjours effectués"
          value={pastCount.toString().padStart(2, "0")}
          gloss="depuis votre inscription"
        />
      </section>

      {/* Prochain séjour — encart prominent */}
      {upcoming && (
        <section className="mt-14 space-y-8">
          <SectionHeading
            number="01"
            title="Prochain séjour"
            kicker={`N° ${displayRef(upcoming.id)} — ${formatDate(upcoming.startDate)} → ${formatDate(upcoming.endDate)}`}
          />
          <article className="rounded-md border border-cp-ink bg-cp-paper-deep">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-cp-ink px-6 py-4 sm:px-8">
              <div className="space-y-1">
                <LibraryStamp>
                  N° {displayRef(upcoming.id)} · {nightsBetween(upcoming.startDate, upcoming.endDate)} nuit
                  {nightsBetween(upcoming.startDate, upcoming.endDate) > 1 ? "s" : ""}
                </LibraryStamp>
                <p className="font-display text-2xl italic leading-tight text-cp-ink sm:text-3xl">
                  Du {formatDate(upcoming.startDate)} au {formatDate(upcoming.endDate)}
                </p>
              </div>
              <BookingStatusBadge status={upcoming.status} />
            </div>

            <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 sm:px-8 sm:py-8 lg:grid-cols-3">
              <DetailField label="Pensionnaires concernés">
                <ul className="space-y-1">
                  {upcoming.cats.map((link) => (
                    <li
                      key={link.cat.id}
                      className="font-display text-lg italic leading-tight text-cp-ink"
                    >
                      {link.cat.name}{" "}
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-cp-ink-soft">
                        · N° {displayRef(link.cat.id)}
                      </span>
                    </li>
                  ))}
                </ul>
              </DetailField>
              {upcoming.totalAmount !== null &&
              upcoming.pricePerFirstCat !== null &&
              upcoming.pricePerExtraCat !== null ? (
                <DetailField label="Tarif">
                  <p className="font-display text-3xl font-bold leading-none text-cp-ink">
                    {upcoming.totalAmount.toString()}€
                  </p>
                  <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-cp-ink-soft">
                    {upcoming.pricePerFirstCat.toString()}€ + {upcoming.pricePerExtraCat.toString()}€ × {upcoming.cats.length - 1} ·{" "}
                    {nightsBetween(upcoming.startDate, upcoming.endDate)} nuits
                  </p>
                </DetailField>
              ) : (
                <DetailField label="Devis">
                  <p className="font-display text-2xl italic leading-tight text-cp-cobalt">
                    En cours d&apos;évaluation
                  </p>
                  <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-cp-ink-soft">
                    Réponse de la maison sous 48 h
                  </p>
                </DetailField>
              )}
              <DetailField label="Note de séjour">
                <p className="font-body text-sm leading-relaxed text-cp-ink">
                  {upcoming.clientNotes ?? "Aucune note ajoutée."}
                </p>
              </DetailField>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-cp-ink px-6 py-4 sm:px-8">
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft">
                {upcoming.messages.length} message{upcoming.messages.length > 1 ? "s" : ""}{" "}
                échangé{upcoming.messages.length > 1 ? "s" : ""}
              </p>
              <Link
                href={`/dashboard/bookings/${upcoming.id}`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Ouvrir le séjour →
              </Link>
            </footer>
          </article>
        </section>
      )}

      <RuleDivider className="my-14" />

      {/* La troupe */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            number="02"
            title="Ma troupe"
            kicker={`${cats.length} pensionnaire${cats.length > 1 ? "s" : ""} déclaré${cats.length > 1 ? "s" : ""}.`}
            className="flex-1"
          />
          <Link
            href="/dashboard/cats/new"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            + Déclarer un pensionnaire
          </Link>
        </div>

        {cats.length === 0 ? (
          <EmptyState
            label="Aucun pensionnaire déclaré"
            description="Pour réserver un séjour, commencez par renseigner la fiche d'au moins un chat."
            ctaHref="/dashboard/cats/new"
            ctaLabel="Déclarer un pensionnaire"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((cat) => (
              <Link
                key={cat.id}
                href={`/dashboard/cats/${cat.id}/edit`}
                className="group block outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cp-paprika"
              >
                <CatCard
                  {...toCatCardProps(cat)}
                  className="transition-shadow group-hover:shadow-[6px_6px_0_0_var(--color-cp-ink)]"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      <RuleDivider className="my-14" />

      {/* Historique court */}
      <section className="space-y-8">
        <SectionHeading
          number="03"
          title="Mes séjours récents"
          kicker={`${bookings.length} séjour${bookings.length > 1 ? "s" : ""} au total.`}
        />

        {bookings.length === 0 ? (
          <EmptyState
            label="Aucun séjour à ce jour"
            description="Réservez votre premier séjour quand vous serez prêt — la maison vous répondra sous 48h."
            ctaHref="/dashboard/bookings/new"
            ctaLabel="Réserver un séjour"
          />
        ) : (
          <ul className="border-t border-cp-ink">
            {bookings.slice(0, 5).map((b) => (
              <li
                key={b.id}
                className="grid gap-4 border-b border-cp-ink/30 py-5 sm:grid-cols-[6rem_2fr_3fr_auto] sm:items-center sm:gap-6"
              >
                <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-cp-paprika">
                  N° {displayRef(b.id)}
                </p>
                <p className="font-display text-lg italic leading-tight text-cp-ink">
                  {formatDate(b.startDate)} → {formatDate(b.endDate)}
                </p>
                <p className="font-body text-sm text-cp-ink-soft">
                  {b.cats.map((link) => link.cat.name).join(" · ")} ·{" "}
                  {nightsBetween(b.startDate, b.endDate)} nuit
                  {nightsBetween(b.startDate, b.endDate) > 1 ? "s" : ""}
                </p>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <BookingStatusBadge status={b.status} />
                  <Link
                    href={`/dashboard/bookings/${b.id}`}
                    className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft hover:text-cp-paprika"
                  >
                    Ouvrir →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end">
          <Link
            href="/dashboard/bookings"
            className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft hover:text-cp-paprika"
          >
            Tous les séjours →
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ----- Helpers internes ----------------------------------------------- */

function StatTile({
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
      <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-cp-paprika">
        {label}
      </p>
      <p className="font-display text-6xl font-semibold leading-none tracking-tight text-cp-ink sm:text-7xl">
        {value}
      </p>
      <p className="font-body text-sm text-cp-ink-soft">{gloss}</p>
    </div>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
        {label}
      </p>
      {children}
    </div>
  );
}

function EmptyState({
  label,
  description,
  ctaHref,
  ctaLabel,
}: {
  label: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-md border border-cp-ink/40 bg-cp-paper-deep/60 p-8 sm:p-10">
      <p className="font-display text-2xl italic leading-tight text-cp-ink">
        {label}
      </p>
      <p className="max-w-md font-body text-base leading-relaxed text-cp-ink-soft">
        {description}
      </p>
      <Link href={ctaHref} className={buttonVariants({ size: "sm" })}>
        {ctaLabel} →
      </Link>
    </div>
  );
}
