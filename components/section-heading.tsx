import { cn } from "@/lib/utils";

/// En-tête de section style « entrée de catalogue » : un numéro mono
/// sanguine (« 01. »), un filet d'encre fin, un grand titre Bodoni Moda,
/// et un éventuel kicker en italique Bodoni. Remplace l'ancien
/// `ActHeading` théâtral. Le numéro est obligatoire pour conserver la
/// logique de table des matières.
export function SectionHeading({
  number,
  title,
  kicker,
  align = "left",
  as: Tag = "h2",
  className,
}: {
  number: string;
  title: string;
  kicker?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
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
          "flex items-baseline gap-4",
          align === "center" && "justify-center",
        )}
      >
        <span className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cp-sanguine">
          {number}.
        </span>
        <span aria-hidden className="h-px flex-1 bg-cp-ink" />
      </div>
      <Tag className="font-display text-4xl font-medium leading-[0.98] tracking-[-0.01em] text-cp-ink sm:text-5xl lg:text-6xl">
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
