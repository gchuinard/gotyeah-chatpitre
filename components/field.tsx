import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/// Regroupement label + contrôle + hint/error. Erreur en paprika avec
/// marqueur, indication en italique encre douce, astérisque paprika pour
/// les champs requis. Cohérent avec la DA mid-century — pas de mono caps
/// sur les libellés, juste Manrope semibold lisible.
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>
        <span>{label}</span>
        {required && (
          <span aria-hidden className="font-display text-cp-paprika">
            *
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p className="flex items-baseline gap-2 font-body text-xs font-medium text-cp-paprika">
          <span aria-hidden className="font-mono font-bold">
            ↳
          </span>
          {error}
        </p>
      ) : hint ? (
        <p className="font-display text-sm italic text-cp-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}
