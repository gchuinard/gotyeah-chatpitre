import { cn } from "@/lib/utils";
import { TicketStamp } from "@/components/ticket-stamp";

/// Carte « fiche de pensionnaire ». Maquette uniquement (PHASE 2) — aucune
/// donnée Prisma : toutes les valeurs sont passées en props. La photo est un
/// placeholder structuré filet doré + silhouette gravure tant qu'aucune URL
/// réelle n'est fournie. Les icônes Check/Cross sont des SVG inline (pas de
/// dépendance lucide ici) pour rester cohérent avec le style « trait noir ».

export type CatCardCriteria = {
  sterilized: boolean;
  identified: boolean;
  vaccines: boolean;
  sociable: boolean;
};

export type CatCardProps = {
  name: string;
  photoUrl?: string | null;
  sex?: "MALE" | "FEMALE";
  breed?: string | null;
  ageLabel?: string; // ex. « 4 ans », « 6 mois »
  criteria: CatCardCriteria;
  className?: string;
};

const CRITERIA: { key: keyof CatCardCriteria; label: string }[] = [
  { key: "sterilized", label: "Stérilisé" },
  { key: "identified", label: "Identifié" },
  { key: "vaccines", label: "Vaccins à jour" },
  { key: "sociable", label: "Sociable" },
];

export function CatCard({
  name,
  photoUrl,
  sex,
  breed,
  ageLabel,
  criteria,
  className,
}: CatCardProps) {
  const sexLabel = sex === "MALE" ? "♂" : sex === "FEMALE" ? "♀" : null;
  const subtitle = [breed, ageLabel].filter(Boolean).join(" · ");

  return (
    <article
      className={cn(
        "flex flex-col border-2 border-cp-brass bg-cp-paper text-cp-ink shadow-[3px_3px_0_0_rgb(26_20_16/0.15)]",
        className,
      )}
    >
      <PhotoPlaceholder name={name} photoUrl={photoUrl} />

      <div className="flex flex-col gap-3 px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-2xl leading-tight">{name}</h3>
          {sexLabel && (
            <span aria-hidden className="font-display text-xl text-cp-crimson">
              {sexLabel}
            </span>
          )}
        </div>

        {subtitle && <TicketStamp>{subtitle}</TicketStamp>}

        <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {CRITERIA.map(({ key, label }) => {
            const ok = criteria[key];
            return (
              <li
                key={key}
                className={cn(
                  "flex items-center gap-1.5 font-body text-xs",
                  ok ? "text-cp-emerald" : "text-cp-crimson/85",
                )}
              >
                {ok ? <IconCheck /> : <IconCross />}
                <span
                  className={ok ? "" : "line-through decoration-cp-crimson/70"}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}

function PhotoPlaceholder({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl?: string | null;
}) {
  if (photoUrl) {
    // Pour PHASE 2 on reste sur <img> brut ; la bascule next/image se fera
    // quand les vraies photos arriveront (prompt « intégration »).
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={`Portrait de ${name}`}
        className="aspect-square w-full object-cover"
      />
    );
  }
  return (
    <div className="relative aspect-square w-full overflow-hidden border-b-2 border-cp-brass bg-cp-cream">
      <div className="absolute inset-3 flex flex-col items-center justify-center gap-3 border border-cp-brass/55">
        <CatSilhouette className="size-20 text-cp-ink/40" />
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-cp-ink-soft/80">
          Portrait à venir
        </span>
      </div>
    </div>
  );
}

/// Silhouette de chat trait noir simplifiée — placeholder en attendant les
/// illustrations gravure finales.
function CatSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M14 28 L18 12 L28 22" />
      <path d="M50 28 L46 12 L36 22" />
      <path d="M14 28 C 14 44 22 52 32 52 C 42 52 50 44 50 28" />
      <circle cx="25" cy="32" r="1.6" fill="currentColor" />
      <circle cx="39" cy="32" r="1.6" fill="currentColor" />
      <path d="M32 38 L30 41 L34 41 Z" fill="currentColor" />
      <path d="M32 41 L32 44" />
      <path d="M32 44 C 30 45.5 29 45 28.5 44" />
      <path d="M32 44 C 34 45.5 35 45 35.5 44" />
      <path d="M22 39 L14 38" />
      <path d="M22 41 L14 42" />
      <path d="M42 39 L50 38" />
      <path d="M42 41 L50 42" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5 shrink-0"
      aria-hidden
    >
      <path d="M3 8.5 L6.5 12 L13 4" />
    </svg>
  );
}

function IconCross() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5 shrink-0"
      aria-hidden
    >
      <path d="M4 4 L12 12 M12 4 L4 12" />
    </svg>
  );
}
