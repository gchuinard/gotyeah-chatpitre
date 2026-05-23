import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/// Regroupement label + contrôle + indication / erreur. Le contrôle est
/// fourni par le caller (Input, Select, Textarea…). Erreur en sanguine
/// avec marqueur dièse, indication en italique encre douce, astérisque
/// sanguine pour les champs requis.
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
          <span aria-hidden className="font-display text-cp-sanguine">
            *
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p className="flex items-baseline gap-2 font-body text-xs font-medium text-cp-sanguine">
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
