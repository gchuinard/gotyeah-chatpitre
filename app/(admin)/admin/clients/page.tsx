import Link from "next/link";

import { AdminClientsTable } from "@/components/admin-clients-table";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { prisma } from "@/lib/db";
import { displayRef, formatDate, getAllClients } from "@/lib/repository";

/// Liste admin des comptes clients — Prisma, avec compteurs cats et bookings
/// pour chaque ligne (sous-queries via _count).

export default async function AdminClientsListPage() {
  const [clients, totalCats] = await Promise.all([
    getAllClients(),
    prisma.cat.count(),
  ]);
  const avgCats =
    clients.length > 0 ? (totalCats / clients.length).toFixed(1) : "0,0";

  // Le tri et le filtre se font côté client sur la liste complète : on passe
  // donc des lignes déjà formatées, plus une date ISO pour trier.
  const rows = clients.map((c) => ({
    id: c.id,
    reference: displayRef(c.id),
    name: `${c.firstName} ${c.lastName}`,
    email: c.email,
    phone: c.phone,
    createdAtLabel: formatDate(c.createdAt),
    createdAtISO: c.createdAt.toISOString(),
    catCount: c.catCount,
    bookingCount: c.bookingCount,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      {/* Fil d'Ariane */}
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/admin" className="hover:text-cp-paprika">
          Administration
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Clients</span>
      </nav>

      <header className="space-y-4">
        <LibraryStamp boxed>
          Comptes inscrits, {clients.length} fiche{clients.length > 1 ? "s" : ""}
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Clients
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          Le registre des propriétaires inscrits : leurs fiches félines, leur
          historique de séjours.
        </p>
      </header>

      <RuleDivider className="my-12" />

      {/* Stats compactes */}
      <section
        aria-label="Indicateurs comptes"
        className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink sm:grid-cols-3"
      >
        <StatTile
          label="Comptes inscrits"
          value={clients.length.toString().padStart(2, "0")}
          gloss="Propriétaires actifs"
        />
        <StatTile
          label="Pensionnaires totaux"
          value={totalCats.toString().padStart(2, "0")}
          gloss="Toutes fiches félines confondues"
        />
        <StatTile
          label="Moy. chats / compte"
          value={avgCats}
          gloss="Ratio chats par propriétaire"
        />
      </section>

      <AdminClientsTable clients={rows} />

      <p className="mt-8 max-w-2xl font-body text-sm text-cp-ink-soft">
        Clique sur une ligne pour ouvrir la fiche du client : ses pensionnaires
        (et leurs documents) et son historique de séjours.
      </p>
    </div>
  );
}

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
      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
        {label}
      </p>
      <p className="font-display text-5xl font-bold leading-none tracking-tight text-cp-ink sm:text-6xl">
        {value}
      </p>
      <p className="font-body text-sm text-cp-ink-soft">{gloss}</p>
    </div>
  );
}
