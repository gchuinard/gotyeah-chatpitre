import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/// Petite étiquette caption — JetBrains Mono caps fines, accent paprika
/// par défaut. Forme : tag inline, soit nu, soit encadré (boxed) avec
/// fond paper-deep. Le nom historique « LibraryStamp » est conservé pour
/// limiter les churns d'imports, mais la sémantique est maintenant celle
/// d'une étiquette éditoriale chaleureuse.
export function LibraryStamp({
  children,
  boxed = false,
  tone = "paprika",
  className,
}: {
  children: ReactNode;
  boxed?: boolean;
  tone?: "paprika" | "cobalt" | "feuille" | "canari" | "ink";
  className?: string;
}) {
  const toneClass = {
    paprika: "text-cp-paprika",
    cobalt: "text-cp-cobalt",
    feuille: "text-cp-feuille",
    canari: "text-cp-canari-deep",
    ink: "text-cp-ink",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em]",
        toneClass,
        boxed && "rounded-sm border border-current bg-cp-paper-deep/60 px-2.5 py-1",
        className,
      )}
    >
      {children}
    </span>
  );
}
