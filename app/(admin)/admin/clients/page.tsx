import Link from "next/link";

import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { CATS, CLIENTS } from "@/lib/fixtures";

/// Liste admin des comptes clients : table brutalist façon fiche
/// bibliothèque, ordonnée par date d'inscription décroissante (les
/// derniers arrivés d'abord, puis l'historique).

export default function AdminClientsListPage() {
  // Tri stable : ordre des fixtures (déjà chronologique inversé).
  const clients = CLIENTS;
  const totalCats = CATS.length;
  const avgCats = (totalCats / clients.length).toFixed(1);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      {/* Fil d'Ariane */}
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/admin" className="hover:text-cp-sanguine">
          Administration
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Clients</span>
      </nav>

      <header className="space-y-4">
        <LibraryStamp boxed>
          § Comptes inscrits — {clients.length} fiche{clients.length > 1 ? "s" : ""}
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Clients
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          Le registre des propriétaires inscrits — leurs fiches félines, leur
          historique de séjours.
        </p>
      </header>

      <RuleDivider weight="heavy" className="my-12" />

      {/* Stats compactes */}
      <section
        aria-label="Indicateurs comptes"
        className="grid gap-px overflow-hidden border border-cp-ink bg-cp-ink sm:grid-cols-3"
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

      <div className="mt-14 overflow-x-auto border border-cp-ink">
        <table className="w-full min-w-[60rem] border-collapse text-left">
          <thead className="bg-cp-paper-deep">
            <tr>
              <Th>N° fiche</Th>
              <Th>Propriétaire</Th>
              <Th>Contact</Th>
              <Th>Inscrit le</Th>
              <Th className="text-center">Pensionnaires</Th>
              <Th className="text-center">Séjours</Th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr
                key={c.id}
                className="border-t border-cp-ink/20 transition-colors hover:bg-cp-paper-deep/40"
              >
                <Td>
                  <p className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cp-sanguine">
                    {c.id.replace("u-", "").padStart(3, "0")}
                  </p>
                </Td>
                <Td>
                  <p className="font-display text-2xl italic leading-tight text-cp-ink">
                    {c.firstName} {c.lastName}
                  </p>
                </Td>
                <Td>
                  <p className="font-body text-sm text-cp-ink">
                    <a
                      href={`mailto:${c.email}`}
                      className="underline underline-offset-4 decoration-cp-ink/30 hover:decoration-cp-sanguine hover:text-cp-sanguine"
                    >
                      {c.email}
                    </a>
                  </p>
                  {c.phone && (
                    <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-cp-ink-soft">
                      {c.phone}
                    </p>
                  )}
                </Td>
                <Td>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-cp-ink">
                    {c.createdAt}
                  </p>
                </Td>
                <Td className="text-center">
                  <p className="font-display text-2xl font-bold leading-none text-cp-ink">
                    {c.catCount.toString().padStart(2, "0")}
                  </p>
                </Td>
                <Td className="text-center">
                  <p className="font-display text-2xl font-bold leading-none text-cp-ink">
                    {c.bookingCount.toString().padStart(2, "0")}
                  </p>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 max-w-2xl font-body text-sm text-cp-ink-soft">
        Le détail d&apos;une fiche client (historique complet des séjours,
        rendez-vous, notes admin) sera ajouté quand le câblage Prisma sera
        en place — pour l&apos;instant ces lignes servent à valider la mise
        en page.
      </p>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`border-b border-cp-ink px-4 py-3 font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-4 align-top ${className ?? ""}`}>{children}</td>
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
      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-sanguine">
        {label}
      </p>
      <p className="font-display text-5xl font-bold leading-none tracking-tight text-cp-ink sm:text-6xl">
        {value}
      </p>
      <p className="font-body text-sm text-cp-ink-soft">{gloss}</p>
    </div>
  );
}
