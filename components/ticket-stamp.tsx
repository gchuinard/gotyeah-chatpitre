import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/// Mention mono façon ticket : « N° 001 — Acte I — Représentation Quotidienne ».
/// Variante `boxed` avec encadrement fin (timbre tamponné).
export function TicketStamp({
  children,
  boxed = false,
  className,
}: {
  children: ReactNode;
  boxed?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-cp-ink-soft",
        boxed && "border border-cp-ink-soft/60 px-2.5 py-1",
        className,
      )}
    >
      {children}
    </span>
  );
}
