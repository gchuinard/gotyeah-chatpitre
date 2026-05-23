import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/// Encadré « page de garde » : cadre ink fin sur fond paper / paper-deep
/// ou bloc de couleur saturé (cobalt, paprika, feuille) avec texte cream.
/// Pour citations, exigences, blocs à mettre en valeur.
export function RuledBox({
  children,
  className,
  variant = "regular",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  variant?: "regular" | "deep" | "cobalt" | "paprika" | "feuille" | "ink";
  as?: "div" | "aside" | "section" | "blockquote" | "article";
}) {
  const variantClasses = {
    regular: "border border-cp-ink bg-cp-paper",
    deep: "border border-cp-ink bg-cp-paper-deep",
    cobalt: "border border-cp-cobalt bg-cp-cobalt text-cp-paper",
    paprika: "border border-cp-paprika bg-cp-paprika text-cp-paper",
    feuille: "border border-cp-feuille bg-cp-feuille text-cp-paper",
    ink: "border border-cp-ink bg-cp-ink text-cp-paper",
  }[variant];

  return (
    <Tag
      className={cn(
        "rounded-md p-6 sm:p-8",
        variantClasses,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
