import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { ClientAdminNotes } from "@/components/client-admin-notes";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import {
  ageLabel,
  displayRef,
  formatDate,
  getClientForAdmin,
  nightsBetween,
} from "@/lib/repository";

/// Fiche d'un compte client côté admin : contact, ses pensionnaires (→ fiche
/// chat) et ses séjours (→ détail séjour).
export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) return null;

  const client = await getClientForAdmin(id);
  if (!client) notFound();

  const address = [client.address, client.postalCode, client.city]
    .filter(Boolean)
    .join(", ");

  // Total facturé : somme des séjours chiffrés (acceptés + terminés). Aucune
  // facture n'est stockée en base — les montants viennent des devis posés.
  const totalBilled = client.bookings
    .filter((b) => (b.status === "ACCEPTED" || b.status === "COMPLETED") && b.totalAmount !== null)
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);
  // Total encaissé : montants réellement payés, saisis par l'admin sur chaque séjour.
  const totalCollected = client.bookings.reduce(
    (sum, b) => sum + Number(b.paidAmount ?? 0),
    0,
  );
  const remaining = totalBilled - totalCollected;

  return (
    <article className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/admin" className="hover:text-cp-paprika">
          Administration
        </Link>
        <span aria-hidden>/</span>
        <Link href="/admin/clients" className="hover:text-cp-paprika">
          Clients
        </Link>
        <span aria-hidden>/</span>
        <span className="min-w-0 break-words text-cp-ink">
          {client.firstName} {client.lastName}
        </span>
      </nav>

      {/* Retour direct en haut de page : le fil d'Ariane seul est trop discret
          quand la fiche est longue. */}
      <Link
        href="/admin/clients"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "mb-6",
        })}
      >
        ← Retour aux clients
      </Link>

      <header className="space-y-4">
        <LibraryStamp boxed>Fiche N°{displayRef(client.id)}</LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink break-words sm:text-6xl">
          {client.firstName} {client.lastName}
        </h1>
        <p className="font-display text-xl italic leading-snug text-cp-ink-soft">
          Inscrit le {formatDate(client.createdAt)} · {client.cats.length} chat
          {client.cats.length > 1 ? "s" : ""} · {client.bookings.length} séjour
          {client.bookings.length > 1 ? "s" : ""}
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <DetailTile label="Email">
          <a
            href={`mailto:${client.email}`}
            className="font-body text-base break-words text-cp-ink underline underline-offset-4 decoration-cp-ink/30 hover:text-cp-paprika hover:decoration-cp-paprika"
          >
            {client.email}
          </a>
        </DetailTile>
        <DetailTile label="Téléphone">
          {client.phone ? (
            <a
              href={`tel:${client.phone}`}
              className="font-body text-base text-cp-ink hover:text-cp-paprika"
            >
              {client.phone}
            </a>
          ) : (
            <span className="font-body text-base text-cp-mute">Non renseigné</span>
          )}
        </DetailTile>
        <DetailTile label="Adresse">
          <span className="font-body text-base text-cp-ink">
            {address || <span className="text-cp-mute">Non renseignée</span>}
          </span>
        </DetailTile>
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-3">
        <DetailTile label="Total facturé">
          <span className="font-display text-3xl font-bold leading-none text-cp-ink">
            {totalBilled.toLocaleString("fr-FR")}€
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
            séjours acceptés + terminés
          </span>
        </DetailTile>
        <DetailTile label="Total encaissé">
          <span className="font-display text-3xl font-bold leading-none text-cp-feuille">
            {totalCollected.toLocaleString("fr-FR")}€
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
            paiements enregistrés
          </span>
        </DetailTile>
        <DetailTile label="Reste à encaisser">
          <span
            className={`font-display text-3xl font-bold leading-none ${remaining > 0 ? "text-cp-paprika" : "text-cp-ink"}`}
          >
            {remaining.toLocaleString("fr-FR")}€
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
            {remaining > 0 ? "impayé" : "soldé"}
          </span>
        </DetailTile>
      </section>

      <section className="mt-4">
        <div className="rounded-md border border-cp-ink bg-cp-paper p-5 sm:p-6">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
            Note interne
          </p>
          <p className="mb-3 mt-1 font-body text-sm text-cp-ink-soft">
            Visible uniquement par nous.
          </p>
          <ClientAdminNotes clientId={client.id} initialNotes={client.adminNotes} />
        </div>
      </section>

      <RuleDivider className="my-12" label="Pensionnaires" tone="cobalt" />
      <section className="space-y-6">
        <SectionHeading
          number="01"
          title="Pensionnaires"
          kicker="Les chats de ce client, clique pour ouvrir la fiche (et ses documents)."
          tone="cobalt"
        />
        {client.cats.length === 0 ? (
          <p className="font-display text-lg italic text-cp-mute">
            Aucun chat déclaré.
          </p>
        ) : (
          <ul className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink sm:grid-cols-2">
            {client.cats.map((cat) => (
              <li key={cat.id} className="bg-cp-paper">
                <Link
                  href={`/admin/cats/${cat.id}`}
                  className="flex items-center justify-between gap-3 p-5 transition-colors hover:bg-cp-paper-deep/50"
                >
                  <span className="min-w-0">
                    <span className="block font-display text-2xl italic leading-tight text-cp-ink">
                      {cat.name}
                    </span>
                    <span className="font-body text-sm text-cp-ink-soft">
                      {cat.breed ?? "sans race"} · {ageLabel(cat.birthDate)}
                    </span>
                  </span>
                  <span aria-hidden className="font-display text-xl text-cp-paprika">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <RuleDivider className="my-12" label="Séjours" tone="paprika" />
      <section className="space-y-6">
        <SectionHeading
          number="02"
          title="Séjours"
          kicker="L'historique de ce client, clique pour ouvrir le détail du séjour."
          tone="paprika"
        />
        {client.bookings.length === 0 ? (
          <p className="font-display text-lg italic text-cp-mute">
            Aucun séjour.
          </p>
        ) : (
          <ul className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink">
            {client.bookings.map((b) => {
              const nights = nightsBetween(b.startDate, b.endDate);
              return (
                <li key={b.id} className="bg-cp-paper">
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 p-5 transition-colors hover:bg-cp-paper-deep/50"
                  >
                    <span className="min-w-0">
                      <span className="block font-display text-lg italic leading-tight text-cp-ink">
                        Du {formatDate(b.startDate)} au {formatDate(b.endDate)}
                      </span>
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
                        {nights} nuit{nights > 1 ? "s" : ""}
                        {b.cats.length > 0
                          ? ` · ${b.cats.map((bc) => bc.cat.name).join(", ")}`
                          : ""}
                      </span>
                    </span>
                    <BookingStatusBadge status={b.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <RuleDivider className="my-12" />
      <footer>
        <Link
          href="/admin/clients"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← Retour aux clients
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
    <div className="flex flex-col gap-2 rounded-md border border-cp-ink bg-cp-paper p-5">
      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
        {label}
      </p>
      {children}
    </div>
  );
}
