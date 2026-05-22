import { cn } from "@/lib/utils";

/// En-tête de section à la façon d'un programme de cabaret : une mention
/// « ACTE N » en mono cramoisi au-dessus du grand titre Abril, et un éventuel
/// sous-titre en Playfair italique.
export function ActHeading({
  act,
  title,
  kicker,
  align = "left",
  as: Tag = "h2",
  className,
}: {
  act?: string;
  title: string;
  kicker?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {act && (
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.34em] text-cp-crimson">
          Acte {act}
        </p>
      )}
      <Tag className="font-display text-4xl leading-[1.05] text-cp-ink sm:text-5xl">
        {title}
      </Tag>
      {kicker && (
        <p className="font-serif text-lg italic text-cp-ink-soft">{kicker}</p>
      )}
    </div>
  );
}
