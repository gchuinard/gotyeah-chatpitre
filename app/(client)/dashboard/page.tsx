import Link from "next/link";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CatCard } from "@/components/cat-card";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import {
  CURRENT_OWNER_ID,
  getBookingsByOwner,
  getCat,
  getCatsByOwner,
} from "@/lib/fixtures";

/// Mon espace — tableau de bord brutalist editorial. Statiques sur fixtures
/// (cf. lib/fixtures.ts) ; le câblage Prisma viendra dans le prompt #3.

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const firstName = user?.firstName ?? "Pensionnaire";

  const bookings = getBookingsByOwner(CURRENT_OWNER_ID);
  const cats = getCatsByOwner(CURRENT_OWNER_ID);

  // Prochain séjour = celui dont le statut est PENDING/QUESTION_ASKED/ACCEPTED
  const upcoming = bookings.find((b) =>
    ["PENDING", "QUESTION_ASKED", "ACCEPTED"].includes(b.status),
  );
  const pastCount = bookings.filter((b) => b.status === "COMPLETED").length;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      {/* En-tête éditoriale */}
      <header className="space-y-5">
        <LibraryStamp boxed>
          § fiche personnelle — {firstName}
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl lg:text-7xl">
          Bonjour, {firstName}.
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft sm:text-2xl">
          {cats.length === 0
            ? "Aucun pensionnaire enregistré. Commencez par déclarer votre première fiche féline."
            : upcoming
              ? `Prochain séjour le ${upcoming.startDate}. ${cats.length} pensionnaire${cats.length > 1 ? "s" : ""} dans votre troupe.`
              : "Pas de séjour en cours. Tout va bien."}
        </p>
      </header>

      <RuleDivider weight="heavy" className="my-14" />

      {/* Stats compactes */}
      <section className="grid gap-px overflow-hidden border border-cp-ink bg-cp-ink sm:grid-cols-3">
        <StatTile
          label="Pensionnaires"
          value={cats.length.toString().padStart(2, "0")}
          gloss={cats.map((c) => c.name).join(" · ") || "Aucun"}
        />
        <StatTile
          label="Séjours à venir"
          value={(bookings.length - pastCount).toString().padStart(2, "0")}
          gloss={upcoming ? `Prochain le ${upcoming.startDate}` : "Aucun planifié"}
        />
        <StatTile
          label="Séjours effectués"
          value={pastCount.toString().padStart(2, "0")}
          gloss={`depuis votre inscription`}
        />
      </section>

      {/* Prochain séjour — encart prominent */}
      {upcoming && (
        <section className="mt-14 space-y-8">
          <SectionHeading
            number="01"
            title="Prochain séjour"
            kicker={`N° ${upcoming.reference} — ${upcoming.startDate} → ${upcoming.endDate}`}
          />
          <article className="border border-cp-ink bg-cp-paper-deep">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-cp-ink px-6 py-4 sm:px-8">
              <div className="space-y-1">
                <LibraryStamp>
                  N° {upcoming.reference} · {upcoming.nights} nuit{upcoming.nights > 1 ? "s" : ""}
                </LibraryStamp>
                <p className="font-display text-2xl italic leading-tight text-cp-ink sm:text-3xl">
                  Du {upcoming.startDate} au {upcoming.endDate}
                </p>
              </div>
              <BookingStatusBadge status={upcoming.status} />
            </div>

            <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 sm:px-8 sm:py-8 lg:grid-cols-3">
              <DetailField label="Pensionnaires concernés">
                <ul className="space-y-1">
                  {upcoming.catIds.map((catId) => {
                    const cat = getCat(catId);
                    if (!cat) return null;
                    return (
                      <li
                        key={catId}
                        className="font-display text-lg italic leading-tight text-cp-ink"
                      >
                        {cat.name}{" "}
                        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-cp-ink-soft">
                          · N° {cat.reference}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </DetailField>
              <DetailField label="Tarif">
                <p className="font-display text-3xl font-bold leading-none text-cp-ink">
                  {upcoming.total}€
                </p>
                <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-cp-ink-soft">
                  {upcoming.pricePerNight}€ × {upcoming.nights} nuits
                </p>
              </DetailField>
              <DetailField label="Note de séjour">
                <p className="font-body text-sm leading-relaxed text-cp-ink">
                  {upcoming.notes ?? "Aucune note ajoutée."}
                </p>
              </DetailField>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-cp-ink px-6 py-4 sm:px-8">
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft">
                {upcoming.messages.length} message{upcoming.messages.length > 1 ? "s" : ""}{" "}
                échangé{upcoming.messages.length > 1 ? "s" : ""}
              </p>
              <Link
                href={`/dashboard/bookings/${upcoming.reference}`}
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
              <CatCard
                key={cat.id}
                reference={cat.reference}
                name={cat.name}
                sex={cat.sex}
                breed={cat.breed}
                ageLabel={cat.ageLabel}
                criteria={cat.criteria}
              />
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
                <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-cp-sanguine">
                  N° {b.reference}
                </p>
                <p className="font-display text-lg italic leading-tight text-cp-ink">
                  {b.startDate} → {b.endDate}
                </p>
                <p className="font-body text-sm text-cp-ink-soft">
                  {b.catIds
                    .map((id) => getCat(id)?.name)
                    .filter(Boolean)
                    .join(" · ")}{" "}
                  · {b.nights} nuit{b.nights > 1 ? "s" : ""}
                </p>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <BookingStatusBadge status={b.status} />
                  <Link
                    href={`/dashboard/bookings/${b.reference}`}
                    className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft hover:text-cp-sanguine"
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
            className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft hover:text-cp-sanguine"
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
    <div className="flex flex-col gap-1 bg-cp-paper p-6 sm:p-8">
      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-sanguine">
        {label}
      </p>
      <p className="font-display text-6xl font-bold leading-none tracking-tight text-cp-ink sm:text-7xl">
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
      <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em] text-cp-sanguine">
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
    <div className="flex flex-col items-start gap-4 border border-cp-ink/40 bg-cp-paper-deep/60 p-8 sm:p-10">
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
