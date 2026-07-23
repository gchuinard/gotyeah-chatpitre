"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { isPlainRowClick, SortableTh, Td, Th } from "@/components/ui/sortable-th";

/// Tableau des pensionnaires : recherche par nom de chat OU de propriétaire,
/// tri par colonne, ligne entièrement cliquable.
///
/// Existe parce qu'au téléphone un propriétaire dit « c'est pour Pamplemousse »,
/// rarement « c'est pour le dossier Vandenbossche ». Sans cette page, retrouver
/// un chat imposait de passer par son client ou par un séjour.

export type AdminCatRow = {
  id: string;
  name: string;
  /// Déjà rédigé côté serveur : « Mâle · Chartreux · 3 ans ».
  identity: string;
  ownerId: string;
  ownerName: string;
  bookingCount: number;
  /// Vrai si un séjour accepté couvre la journée d'aujourd'hui.
  inHouse: boolean;
};

type SortKey = "name" | "owner" | "bookings";

const SORTABLE: { key: SortKey; label: string; align?: "center" }[] = [
  { key: "name", label: "Pensionnaire" },
  { key: "owner", label: "Propriétaire" },
  { key: "bookings", label: "Séjours", align: "center" },
];

/// Compare sans tenir compte des accents ni de la casse : « pamplemousse »
/// doit trouver « Pamplemousse », et « beatrice » doit trouver « Béatrice ».
/// Sans cela, la recherche échoue précisément sur les noms de chats, qui sont
/// souvent accentués.
function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function AdminCatsTable({ cats }: { cats: AdminCatRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  const rows = useMemo(() => {
    const q = fold(query.trim());
    const filtered = q
      ? cats.filter(
          (c) => fold(c.name).includes(q) || fold(c.ownerName).includes(q),
        )
      : cats;

    const dir = asc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "owner":
          // Départagé par le nom du chat : deux chats du même foyer se lisent
          // alors dans un ordre stable et non au hasard des lignes.
          return (
            dir * a.ownerName.localeCompare(b.ownerName, "fr") ||
            a.name.localeCompare(b.name, "fr")
          );
        case "bookings":
          return dir * (a.bookingCount - b.bookingCount);
        default:
          return dir * a.name.localeCompare(b.name, "fr");
      }
    });
  }, [cats, query, sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAsc((v) => !v);
      return;
    }
    setSortKey(key);
    setAsc(true);
  }

  return (
    <div className="mt-14 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un chat ou son propriétaire…"
            aria-label="Filtrer les pensionnaires"
          />
        </div>
        <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
          {rows.length} pensionnaire{rows.length > 1 ? "s" : ""}
          {query && ` sur ${cats.length}`}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-cp-ink">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <thead className="bg-cp-paper-deep">
            <tr>
              {SORTABLE.map((col) => (
                <SortableTh
                  key={col.key}
                  label={col.label}
                  sortKey={col.key}
                  active={sortKey}
                  asc={asc}
                  onSort={toggleSort}
                  className={col.align === "center" ? "text-center" : undefined}
                />
              ))}
              <Th>Présence</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center font-display text-xl italic text-cp-ink-soft"
                >
                  Aucun pensionnaire ne correspond à cette recherche.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr
                  key={c.id}
                  onClick={(e) => {
                    if (!isPlainRowClick(e)) return;
                    router.push(`/admin/cats/${c.id}`);
                  }}
                  className="cursor-pointer border-t border-cp-ink/20 transition-colors hover:bg-cp-paper-deep/40"
                >
                  <Td>
                    {/* Vrai lien conservé : la ligne cliquable ne suffit pas au
                        clavier ni aux lecteurs d'écran. */}
                    <Link
                      href={`/admin/cats/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-display text-2xl italic leading-tight text-cp-ink hover:text-cp-paprika"
                    >
                      {c.name}
                    </Link>
                    {/* L'identité distingue deux homonymes : sans elle, deux
                        Salami se ressemblent trait pour trait. */}
                    <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-cp-ink-soft">
                      {c.identity}
                    </p>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/clients/${c.ownerId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-cp-ink hover:text-cp-paprika"
                    >
                      {c.ownerName}
                    </Link>
                  </Td>
                  <Td className="text-center">
                    <p className="font-display text-2xl font-bold leading-none text-cp-ink">
                      {c.bookingCount.toString().padStart(2, "0")}
                    </p>
                  </Td>
                  <Td>
                    {c.inHouse && (
                      <span className="inline-flex items-center rounded-full border border-cp-paprika bg-cp-paprika px-2.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-paper">
                        En séjour
                      </span>
                    )}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
