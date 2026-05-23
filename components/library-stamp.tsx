import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/// Tampon « fiche bibliothèque » : mono caps espacées, optionnellement
/// encadrées de manière à reproduire un tampon de prêt. Pour numéros de
/// référence, mentions catalogue, références de séjour.
export function LibraryStamp({
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
        "inline-flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft",
        boxed && "border border-cp-ink/60 px-2.5 py-1",
        className,
      )}
    >
      {children}
    </span>
  );
}
