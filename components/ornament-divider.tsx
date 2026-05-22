import { cn } from "@/lib/utils";

/// Séparateur ornemental à la mode « affiche imprimée » :
///   ─── ❦ — ❦ — ❦ ───
/// Variante avec libellé centré entre deux ornements (`label`) ou ornements
/// seuls. Les glyphes sont rendus en serif pour un dessin homogène quel que
/// soit le navigateur.
export function OrnamentDivider({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("flex items-center gap-4 text-cp-brass", className)}
    >
      <span aria-hidden className="h-px flex-1 bg-cp-brass/55" />
      {label ? (
        <>
          <span aria-hidden className="font-serif text-base leading-none">
            ❦
          </span>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-cp-ink-soft">
            {label}
          </span>
          <span aria-hidden className="font-serif text-base leading-none">
            ❦
          </span>
        </>
      ) : (
        <span
          aria-hidden
          className="font-serif text-base leading-none tracking-[0.4em]"
        >
          ❦&nbsp;—&nbsp;❦&nbsp;—&nbsp;❦
        </span>
      )}
      <span aria-hidden className="h-px flex-1 bg-cp-brass/55" />
    </div>
  );
}
