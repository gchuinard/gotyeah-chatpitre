import { cn } from "@/lib/utils";

/// En-têtes des tableaux d'administration, communs à la liste des clients et à
/// celle des séjours, qui les dupliquaient à l'identique.
///
/// La flèche ▲▼ est purement décorative : elle est masquée aux technologies
/// d'assistance. L'état du tri passe donc par `aria-sort` sur la colonne et par
/// un libellé de bouton qui dit la colonne, l'état courant et ce que fera le
/// clic. Sans ça, l'ordre du tableau n'était restitué par aucun canal
/// accessible.

export function Th({
  children,
  className,
  ariaSort,
}: {
  children?: React.ReactNode;
  className?: string;
  /// Omis sur les colonnes non triables : c'est le comportement ARIA correct.
  ariaSort?: "ascending" | "descending" | "none";
}) {
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`border-b border-cp-ink px-4 py-3 font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

export function SortableTh<K extends string>({
  label,
  sortKey,
  active,
  asc,
  onSort,
  className,
}: {
  label: string;
  sortKey: K;
  active: K;
  asc: boolean;
  onSort: (key: K) => void;
  className?: string;
}) {
  const isActive = active === sortKey;
  return (
    <Th
      className={className}
      ariaSort={isActive ? (asc ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-label={
          isActive
            ? `Trier par ${label}, tri actif en ordre ${asc ? "croissant" : "décroissant"}, cliquer pour inverser`
            : `Trier par ${label}`
        }
        className="inline-flex items-center gap-1.5 uppercase tracking-[0.22em] transition-colors hover:text-cp-paprika"
      >
        {label}
        <span
          aria-hidden
          className={cn("text-[0.7rem]", isActive ? "text-cp-paprika" : "text-cp-ink/25")}
        >
          {isActive ? (asc ? "▲" : "▼") : "▲"}
        </span>
      </button>
    </Th>
  );
}
