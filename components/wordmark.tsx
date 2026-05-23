import { cn } from "@/lib/utils";

/// Logotype « Le Chat-Pitre ». Bodoni Moda bold, capitales avec tracking
/// aéré : marque institutionnelle, lisible aussi bien à 10px (nav) qu'à
/// 160px (hero). Polymorphe via `as` pour rester sémantique selon le
/// contexte (h1 sur la home, span dans une nav, div dans un footer).
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
        "font-display font-bold uppercase leading-[0.92] tracking-[0.04em] text-cp-ink",
        className,
      )}
    >
      Le Chat-Pitre
    </Tag>
  );
}
