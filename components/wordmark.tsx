import { cn } from "@/lib/utils";

/// Logotype « Le Chat-Pitre ». Newsreader display italic (avec le tiret
/// hyper expressif des polices Newsreader en gros corps) : marque qui
/// respire la chaleur d'un livre d'illustration. Polymorphe via `as`.
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
        "font-display font-medium italic leading-[0.92] tracking-[-0.02em] text-cp-ink",
        className,
      )}
    >
      Le Chat-Pitre
    </Tag>
  );
}
