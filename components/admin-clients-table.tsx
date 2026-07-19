"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SortableTh, Th } from "@/components/ui/sortable-th";
import { cn } from "@/lib/utils";

/// Tableau des comptes clients : recherche, tri par colonne, ligne entièrement
/// cliquable (avec le nom qui reste un vrai lien pour le clavier et les
/// lecteurs d'écran) et bouton « copier le mail ». Les données arrivent déjà
/// formatées du serveur, le tri se fait en mémoire sur la liste complète.

export type AdminClientRow = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string | null;
  createdAtLabel: string;
  createdAtISO: string;
  catCount: number;
  bookingCount: number;
};

type SortKey = "name" | "createdAt" | "cats" | "bookings";

const SORTABLE: { key: SortKey; label: string; align?: "center" }[] = [
  { key: "name", label: "Propriétaire" },
  { key: "createdAt", label: "Inscrit le" },
  { key: "cats", label: "Pensionnaires", align: "center" },
  { key: "bookings", label: "Séjours", align: "center" },
];

export function AdminClientsTable({ clients }: { clients: AdminClientRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? clients.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.phone ?? "").toLowerCase().includes(q) ||
            c.reference.toLowerCase().includes(q),
        )
      : clients;

    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "createdAt":
          return a.createdAtISO.localeCompare(b.createdAtISO);
        case "cats":
          return a.catCount - b.catCount;
        case "bookings":
          return a.bookingCount - b.bookingCount;
        default:
          return a.name.localeCompare(b.name, "fr");
      }
    });
    return asc ? sorted : sorted.reverse();
  }, [clients, query, sortKey, asc]);

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
            placeholder="Chercher un nom, un mail, un téléphone…"
            aria-label="Filtrer les clients"
          />
        </div>
        <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
          {rows.length} fiche{rows.length > 1 ? "s" : ""}
          {query && ` sur ${clients.length}`}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-cp-ink">
        <table className="w-full min-w-[60rem] border-collapse text-left">
          <thead className="bg-cp-paper-deep">
            <tr>
              <Th>N° fiche</Th>
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
              <Th>Contact</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center font-display text-xl italic text-cp-ink-soft">
                  Aucun client ne correspond à cette recherche.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr
                  key={c.id}
                  onClick={(e) => {
                    if (!isPlainRowClick(e)) return;
                    router.push(`/admin/clients/${c.id}`);
                  }}
                  className="cursor-pointer border-t border-cp-ink/20 transition-colors hover:bg-cp-paper-deep/40"
                >
                  <Td>
                    <span className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cp-paprika">
                      N°{c.reference}
                    </span>
                  </Td>
                  <Td>
                    {/* Vrai lien conservé : la ligne cliquable ne suffit pas au clavier. */}
                    <Link
                      href={`/admin/clients/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-display text-2xl italic leading-tight text-cp-ink hover:text-cp-paprika"
                    >
                      {c.name}
                    </Link>
                  </Td>
                  <Td>
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-cp-ink">
                      {c.createdAtLabel}
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
                  <Td>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${c.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-body text-sm text-cp-ink underline underline-offset-4 decoration-cp-ink/30 hover:decoration-cp-paprika hover:text-cp-paprika"
                      >
                        {c.email}
                      </a>
                      <CopyMailButton email={c.email} />
                    </div>
                    {c.phone && (
                      <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-cp-ink-soft">
                        {c.phone}
                      </p>
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

/// Vrai seulement pour un clic gauche simple hors sélection de texte : on
/// laisse passer ctrl/cmd-clic (ouvrir dans un onglet via le lien du nom) et on
/// n'ouvre pas la fiche à la fin d'un glisser de sélection.
function isPlainRowClick(e: React.MouseEvent): boolean {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (window.getSelection()?.toString()) return false;
  return true;
}

/// Copie l'adresse dans le presse-papier, avec un retour visuel bref.
function CopyMailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        // `navigator.clipboard` n'existe pas hors contexte sécurisé (accès
        // direct au Pi en HTTP, hors du proxy). Le déréférencer lèverait avant
        // que la chaîne `.then().catch()` n'existe, donc le `catch` ne pouvait
        // rien rattraper : il faut un vrai try/catch autour de l'accès.
        void (async () => {
          try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            // Sans presse-papier, l'adresse reste sélectionnable juste à côté.
          }
        })();
      }}
      aria-label={copied ? "Adresse copiée" : `Copier ${email}`}
      title={copied ? "Copié" : "Copier le mail"}
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-md border transition-colors",
        copied
          ? "border-cp-feuille bg-cp-feuille text-cp-paper"
          : "border-cp-ink/30 bg-cp-paper text-cp-ink-soft hover:border-cp-cobalt hover:bg-cp-cobalt hover:text-cp-paper",
      )}
    >
      {copied ? (
        <Check className="size-3.5" strokeWidth={2.2} aria-hidden />
      ) : (
        <Copy className="size-3.5" strokeWidth={1.8} aria-hidden />
      )}
    </button>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-4 align-top ${className ?? ""}`}>{children}</td>;
}
