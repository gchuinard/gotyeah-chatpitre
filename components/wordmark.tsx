import { cn } from "@/lib/utils";

/// Logotype « Le Chat-Pitre ». Réutilisé dans le hero, les en-têtes, le pied.
/// Polymorphe via `as` pour rester sémantique selon le contexte (h1 sur la
/// home, span dans une nav).
export function Wordmark({
  className,
  as: Tag = "span",
}: {
  className?: string;
  as?: "span" | "h1" | "div";
}) {
  return (
    <Tag
      className={cn(
        "font-display leading-none tracking-tight text-cp-ink",
        className,
      )}
    >
      Le Chat-Pitre
    </Tag>
  );
}
