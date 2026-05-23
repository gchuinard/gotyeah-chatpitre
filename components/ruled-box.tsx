import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/// Encadré brutalist editorial : trait encre 1.5px, fond paper-deep
/// optionnel, padding généreux. Pour citations, exigences réglementaires,
/// blocs de mise en valeur. Remplace le filet doré.
export function RuledBox({
  children,
  className,
  variant = "regular",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  variant?: "regular" | "deep" | "inverse";
  as?: "div" | "aside" | "section" | "blockquote" | "article";
}) {
  const variantClasses =
    variant === "deep"
      ? "bg-cp-paper-deep"
      : variant === "inverse"
        ? "bg-cp-ink text-cp-paper"
        : "bg-cp-paper";

  return (
    <Tag className={cn("border border-cp-ink p-6 sm:p-8", variantClasses, className)}>
      {children}
    </Tag>
  );
}
