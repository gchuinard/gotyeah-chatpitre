import { cn } from "@/lib/utils";

/// En-tête de section « livre d'illustration » : un numéro mono dans un
/// bloc coloré (cobalt par défaut), le titre Newsreader grand corps, et
/// un kicker en italique chaud. Plus généreux et coloré que la version
/// brutalist — la couleur du chip souligne la personnalité de la section.

export function SectionHeading({
  number,
  title,
  kicker,
  align = "left",
  as: Tag = "h2",
  tone = "cobalt",
  className,
}: {
  /// Facultatif : les sections rangées en onglets ne se numérotent plus, la
  /// barre d'onglets porte déjà l'orientation.
  number?: string;
  title: string;
  kicker?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  tone?: "cobalt" | "paprika" | "canari" | "feuille" | "ink";
  className?: string;
}) {
  const chipClass = {
    cobalt: "bg-cp-cobalt text-cp-paper",
    paprika: "bg-cp-paprika text-cp-paper",
    canari: "bg-cp-canari text-cp-ink",
    feuille: "bg-cp-feuille text-cp-paper",
    ink: "bg-cp-ink text-cp-paper",
  }[tone];

  return (
    <header
      className={cn(
        "space-y-5",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-4",
          align === "center" && "justify-center",
        )}
      >
        {number && (
          <span
            className={cn(
              "inline-flex h-7 items-center justify-center rounded-sm px-2.5 font-mono text-xs font-bold uppercase tracking-[0.14em]",
              chipClass,
            )}
          >
            n° {number}
          </span>
        )}
        <span aria-hidden className="h-px flex-1 bg-cp-ink/30" />
      </div>
      <Tag className="font-display text-4xl font-medium leading-[1.02] tracking-tight text-cp-ink sm:text-5xl lg:text-6xl">
        {title}
      </Tag>
      {kicker && (
        <p className="font-display text-xl italic leading-snug text-cp-ink-soft sm:text-2xl">
          {kicker}
        </p>
      )}
    </header>
  );
}
