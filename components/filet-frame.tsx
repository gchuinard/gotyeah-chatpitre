import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/// Encadrement « filet doré » : double trait brass sur fond paper, comme un
/// cartouche de programme. Utile pour citations, exigences du règlement,
/// blocs à mettre en valeur.
export function FiletFrame({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div className={cn("border-2 border-cp-brass p-1.5", className)}>
      <div
        className={cn(
          "cp-grain border border-cp-brass/55 bg-cp-paper/40 p-6",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
