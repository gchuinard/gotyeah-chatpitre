"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  BookingStatusBadge,
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_ORDER,
  type BookingStatus,
} from "@/components/booking-status-badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/// Tableau des séjours côté admin : recherche, filtre par statut, tri par
/// colonne, ligne entièrement cliquable. Par défaut on garde l'ordre de
/// traitement (ce qui demande une décision en premier). Les données arrivent
/// déjà formatées du serveur ; filtre et tri se font en mémoire.

export type AdminBookingRow = {
  id: string;
  reference: string;
  status: BookingStatus;
  clientName: string;
  clientEmail: string;
  startISO: string;
  startLabel: string;
  endLabel: string;
  nights: number;
  catNames: string;
  total: number | null;
  totalLabel: string | null;
};

type SortKey = "priority" | "status" | "client" | "dates" | "total";

const SELECT_CLASS =
  "h-10 min-w-0 rounded-md border border-cp-ink bg-cp-paper px-3 font-body text-sm text-cp-ink transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cp-paprika";

export function AdminBookingsTable({ bookings }: { bookings: AdminBookingRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [asc, setAsc] = useState(true);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = bookings.filter((b) => {
      if (status !== "ALL" && b.status !== status) return false;
      if (!q) return true;
      return (
        b.clientName.toLowerCase().includes(q) ||
        b.clientEmail.toLowerCase().includes(q) ||
        b.reference.toLowerCase().includes(q) ||
        b.catNames.toLowerCase().includes(q)
      );
    });

    const priority = (s: BookingStatus) => BOOKING_STATUS_ORDER.indexOf(s);
    // Le sens est appliqué DANS le comparateur : un reverse() global
    // retournerait aussi le placement voulu des « sur devis » en fin de liste.
    const dir = asc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "status":
          return dir * (priority(a.status) - priority(b.status));
        case "client":
          return dir * a.clientName.localeCompare(b.clientName, "fr");
        case "dates":
          return dir * a.startISO.localeCompare(b.startISO);
        case "total":
          // Non chiffrés en fin de liste dans les DEUX sens.
          if (a.total === null && b.total === null) return 0;
          if (a.total === null) return 1;
          if (b.total === null) return -1;
          return dir * (a.total - b.total);
        default:
          return (
            priority(a.status) - priority(b.status) ||
            a.startISO.localeCompare(b.startISO)
          );
      }
    });
  }, [bookings, query, status, sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAsc((v) => !v);
      return;
    }
    setSortKey(key);
    setAsc(true);
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-sm">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un client, un chat, un n°…"
            aria-label="Filtrer les séjours"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BookingStatus | "ALL")}
          aria-label="Filtrer par statut"
          className={SELECT_CLASS}
        >
          <option value="ALL">Tous les statuts</option>
          {BOOKING_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {BOOKING_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <p className="ml-auto font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
          {rows.length} séjour{rows.length > 1 ? "s" : ""}
          {(query || status !== "ALL") && ` sur ${bookings.length}`}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-cp-ink">
        <table className="w-full min-w-[60rem] border-collapse text-left">
          <thead className="bg-cp-paper-deep">
            <tr>
              <Th>N°</Th>
              <SortableTh label="Statut" sortKey="status" active={sortKey} asc={asc} onSort={toggleSort} />
              <SortableTh label="Client" sortKey="client" active={sortKey} asc={asc} onSort={toggleSort} />
              <SortableTh label="Dates" sortKey="dates" active={sortKey} asc={asc} onSort={toggleSort} />
              <Th>Pensionnaires</Th>
              <SortableTh label="Total" sortKey="total" active={sortKey} asc={asc} onSort={toggleSort} className="text-right" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center font-display text-xl italic text-cp-ink-soft">
                  Aucun séjour ne correspond à ce filtre.
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr
                  key={b.id}
                  onClick={(e) => {
                    if (!isPlainRowClick(e)) return;
                    router.push(`/admin/bookings/${b.id}`);
                  }}
                  className="cursor-pointer border-t border-cp-ink/20 transition-colors hover:bg-cp-paper-deep/40"
                >
                  <Td>
                    {/* Vrai lien conservé pour le clavier et les lecteurs d'écran. */}
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cp-paprika hover:text-cp-ink"
                    >
                      N°{b.reference}
                    </Link>
                  </Td>
                  <Td>
                    <BookingStatusBadge status={b.status} />
                  </Td>
                  <Td>
                    <p className="font-display text-lg italic leading-tight text-cp-ink">
                      {b.clientName}
                    </p>
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
                      {b.clientEmail}
                    </p>
                  </Td>
                  <Td>
                    <p className="font-body text-sm leading-snug text-cp-ink">
                      {b.startLabel}
                      <br />
                      <span className="text-cp-ink-soft">→ {b.endLabel}</span>
                    </p>
                    <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
                      {b.nights} nuit{b.nights > 1 ? "s" : ""}
                    </p>
                  </Td>
                  <Td>
                    <p className="font-body text-sm text-cp-ink">{b.catNames}</p>
                  </Td>
                  <Td className="text-right">
                    {b.totalLabel === null ? (
                      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-cobalt">
                        Sur devis
                      </p>
                    ) : (
                      <p className="font-display text-2xl font-bold leading-none text-cp-ink">
                        {b.totalLabel}
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
/// laisse passer ctrl/cmd-clic (ouvrir dans un onglet via le lien du n°) et on
/// n'ouvre pas la fiche à la fin d'un glisser de sélection.
function isPlainRowClick(e: React.MouseEvent): boolean {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (window.getSelection()?.toString()) return false;
  return true;
}

function SortableTh({
  label,
  sortKey,
  active,
  asc,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  asc: boolean;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = active === sortKey;
  return (
    <Th className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-label={`Trier par ${label}`}
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
  return <td className={`px-4 py-4 align-top ${className ?? ""}`}>{children}</td>;
}
