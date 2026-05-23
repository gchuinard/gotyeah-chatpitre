import { cn } from "@/lib/utils";

/// Illustration de chat géométrique flat color — style Charley Harper.
/// 4 palettes (cobalt, paprika, canari, feuille) qui se combinent avec
/// crème pour les surfaces principales. Quatre poses pour varier les
/// fiches : assis, dormant, debout, observant.
///
/// Aucun fichier image — tout en SVG inline pour rester léger, accessible
/// (`aria-label`), et utilisable dans le placeholder photo des fiches
/// pensionnaires tant que les vraies photos ne sont pas en place.

export type CatIllustrationVariant = "cobalt" | "paprika" | "canari" | "feuille";
export type CatIllustrationPose = "sitting" | "sleeping" | "standing" | "watching";

type Palette = {
  bg: string;
  body: string;
  belly: string;
  accent: string;
};

const PALETTES: Record<CatIllustrationVariant, Palette> = {
  cobalt: {
    bg: "var(--color-cp-cobalt)",
    body: "var(--color-cp-paper)",
    belly: "var(--color-cp-canari-light)",
    accent: "var(--color-cp-paprika)",
  },
  paprika: {
    bg: "var(--color-cp-paprika)",
    body: "var(--color-cp-paper)",
    belly: "var(--color-cp-canari-light)",
    accent: "var(--color-cp-cobalt)",
  },
  canari: {
    bg: "var(--color-cp-canari)",
    body: "var(--color-cp-cobalt)",
    belly: "var(--color-cp-cobalt-light)",
    accent: "var(--color-cp-paprika)",
  },
  feuille: {
    bg: "var(--color-cp-feuille)",
    body: "var(--color-cp-paper)",
    belly: "var(--color-cp-canari-light)",
    accent: "var(--color-cp-paprika)",
  },
};

export function CatIllustration({
  variant = "cobalt",
  pose = "sitting",
  className,
  ariaLabel,
}: {
  variant?: CatIllustrationVariant;
  pose?: CatIllustrationPose;
  className?: string;
  ariaLabel?: string;
}) {
  const palette = PALETTES[variant];

  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
    >
      <rect width="240" height="240" fill={palette.bg} />
      {pose === "sitting" && <SittingCat palette={palette} />}
      {pose === "sleeping" && <SleepingCat palette={palette} />}
      {pose === "standing" && <StandingCat palette={palette} />}
      {pose === "watching" && <WatchingCat palette={palette} />}
    </svg>
  );
}

// =====================================================================
// Pose 1 — Chat assis de face, queue qui s'enroule à droite.
// =====================================================================
function SittingCat({ palette }: { palette: Palette }) {
  return (
    <g>
      {/* Queue derrière le corps */}
      <path
        d="M170 200 Q210 170, 205 110 Q200 75, 175 80"
        stroke={palette.body}
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="175" cy="80" r="14" fill={palette.body} />
      <path
        d="M170 200 Q210 170, 205 110 Q200 75, 175 80"
        stroke={palette.accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 14"
        strokeDashoffset="3"
        fill="none"
      />

      {/* Corps (cloche) */}
      <path
        d="M65 210 Q55 130, 95 130 L145 130 Q185 130, 175 210 Z"
        fill={palette.body}
      />

      {/* Ventre */}
      <ellipse cx="120" cy="180" rx="32" ry="38" fill={palette.belly} />

      {/* Tête */}
      <circle cx="120" cy="110" r="50" fill={palette.body} />

      {/* Oreilles */}
      <path d="M75 90 L88 50 L102 88 Z" fill={palette.body} />
      <path d="M165 90 L152 50 L138 88 Z" fill={palette.body} />
      <path d="M82 85 L88 60 L97 82 Z" fill={palette.accent} />
      <path d="M158 85 L152 60 L143 82 Z" fill={palette.accent} />

      {/* Yeux — grands cercles ink avec reflet canari */}
      <circle cx="100" cy="108" r="11" fill="#0a0a0a" />
      <circle cx="140" cy="108" r="11" fill="#0a0a0a" />
      <circle cx="104" cy="104" r="3.5" fill={palette.belly} />
      <circle cx="144" cy="104" r="3.5" fill={palette.belly} />

      {/* Nez */}
      <path d="M120 128 L113 137 L127 137 Z" fill={palette.accent} />

      {/* Bouche */}
      <path
        d="M113 140 Q120 147, 127 140"
        stroke="#0a0a0a"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Moustaches */}
      <line x1="78" y1="128" x2="58" y2="124" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="78" y1="135" x2="58" y2="138" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="162" y1="128" x2="182" y2="124" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="162" y1="135" x2="182" y2="138" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" />

      {/* Pattes avant */}
      <ellipse cx="95" cy="205" rx="16" ry="9" fill={palette.body} />
      <ellipse cx="145" cy="205" rx="16" ry="9" fill={palette.body} />
      {/* Coussinets */}
      <circle cx="89" cy="203" r="2.5" fill="#0a0a0a" opacity="0.55" />
      <circle cx="95" cy="201" r="2.5" fill="#0a0a0a" opacity="0.55" />
      <circle cx="101" cy="203" r="2.5" fill="#0a0a0a" opacity="0.55" />
      <circle cx="139" cy="203" r="2.5" fill="#0a0a0a" opacity="0.55" />
      <circle cx="145" cy="201" r="2.5" fill="#0a0a0a" opacity="0.55" />
      <circle cx="151" cy="203" r="2.5" fill="#0a0a0a" opacity="0.55" />
    </g>
  );
}

// =====================================================================
// Pose 2 — Chat dormant en boule, queue enroulée.
// =====================================================================
function SleepingCat({ palette }: { palette: Palette }) {
  return (
    <g>
      {/* Corps en boule */}
      <ellipse cx="120" cy="155" rx="85" ry="55" fill={palette.body} />

      {/* Queue enroulée par-dessus */}
      <path
        d="M195 155 Q210 140, 195 120 Q175 100, 145 110"
        stroke={palette.body}
        strokeWidth="20"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M195 155 Q210 140, 195 120 Q175 100, 145 110"
        stroke={palette.accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 14"
        strokeDashoffset="3"
        fill="none"
      />

      {/* Tête (incrustée dans la boule) */}
      <circle cx="80" cy="145" r="40" fill={palette.body} />

      {/* Oreilles */}
      <path d="M55 132 L62 100 L77 122 Z" fill={palette.body} />
      <path d="M105 132 L98 100 L83 122 Z" fill={palette.body} />
      <path d="M60 125 L62 110 L72 122 Z" fill={palette.accent} />
      <path d="M100 125 L98 110 L88 122 Z" fill={palette.accent} />

      {/* Yeux fermés — traits courbés */}
      <path d="M62 145 Q68 142, 74 145" stroke="#0a0a0a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M86 145 Q92 142, 98 145" stroke="#0a0a0a" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Nez */}
      <path d="M80 158 L74 166 L86 166 Z" fill={palette.accent} />

      {/* Bouche sereine */}
      <path d="M74 170 Q80 175, 86 170" stroke="#0a0a0a" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Ventre subtil */}
      <ellipse cx="135" cy="172" rx="50" ry="22" fill={palette.belly} />

      {/* "ZZZ" décoratif */}
      <text
        x="140"
        y="80"
        fontFamily="serif"
        fontSize="22"
        fontStyle="italic"
        fontWeight="600"
        fill={palette.body}
      >
        z z z
      </text>
    </g>
  );
}

// =====================================================================
// Pose 3 — Chat debout de profil, queue en l'air.
// =====================================================================
function StandingCat({ palette }: { palette: Palette }) {
  return (
    <g>
      {/* Queue verticale */}
      <path
        d="M55 175 Q40 130, 50 100"
        stroke={palette.body}
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="50" cy="100" r="11" fill={palette.body} />
      <path
        d="M55 175 Q40 130, 50 100"
        stroke={palette.accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 14"
        fill="none"
      />

      {/* Corps allongé */}
      <ellipse cx="125" cy="165" rx="80" ry="35" fill={palette.body} />

      {/* Ventre */}
      <ellipse cx="125" cy="185" rx="55" ry="14" fill={palette.belly} />

      {/* Pattes */}
      <rect x="78" y="180" width="14" height="35" rx="3" fill={palette.body} />
      <rect x="105" y="180" width="14" height="35" rx="3" fill={palette.body} />
      <rect x="148" y="180" width="14" height="35" rx="3" fill={palette.body} />
      <rect x="175" y="180" width="14" height="35" rx="3" fill={palette.body} />

      {/* Tête (à droite) */}
      <circle cx="195" cy="135" r="42" fill={palette.body} />

      {/* Oreilles */}
      <path d="M168 117 L172 84 L188 110 Z" fill={palette.body} />
      <path d="M220 117 L216 84 L202 110 Z" fill={palette.body} />
      <path d="M173 110 L173 96 L184 108 Z" fill={palette.accent} />
      <path d="M215 110 L215 96 L204 108 Z" fill={palette.accent} />

      {/* Œil (profil — un seul visible) */}
      <circle cx="205" cy="132" r="9" fill="#0a0a0a" />
      <circle cx="208" cy="129" r="3" fill={palette.belly} />

      {/* Nez */}
      <path d="M232 138 L226 144 L232 148 Z" fill={palette.accent} />

      {/* Bouche */}
      <path d="M226 150 Q220 152, 215 148" stroke="#0a0a0a" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Moustaches */}
      <line x1="220" y1="142" x2="200" y2="138" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="220" y1="148" x2="200" y2="148" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

// =====================================================================
// Pose 4 — Chat tapi observant, yeux écarquillés.
// =====================================================================
function WatchingCat({ palette }: { palette: Palette }) {
  return (
    <g>
      {/* Queue derrière, basse */}
      <path
        d="M195 195 Q225 200, 220 175"
        stroke={palette.body}
        strokeWidth="20"
        fill="none"
        strokeLinecap="round"
      />

      {/* Corps tapi (low body) */}
      <ellipse cx="120" cy="195" rx="90" ry="35" fill={palette.body} />

      {/* Ventre */}
      <ellipse cx="120" cy="210" rx="65" ry="15" fill={palette.belly} />

      {/* Tête (légèrement penchée, alerte) */}
      <ellipse cx="120" cy="135" rx="55" ry="48" fill={palette.body} />

      {/* Oreilles dressées */}
      <path d="M75 110 L82 65 L100 105 Z" fill={palette.body} />
      <path d="M165 110 L158 65 L140 105 Z" fill={palette.body} />
      <path d="M82 102 L86 78 L96 100 Z" fill={palette.accent} />
      <path d="M158 102 L154 78 L144 100 Z" fill={palette.accent} />

      {/* Yeux écarquillés — pupilles fines verticales */}
      <ellipse cx="100" cy="135" rx="14" ry="16" fill={palette.belly} />
      <ellipse cx="140" cy="135" rx="14" ry="16" fill={palette.belly} />
      <ellipse cx="100" cy="135" rx="3.5" ry="13" fill="#0a0a0a" />
      <ellipse cx="140" cy="135" rx="3.5" ry="13" fill="#0a0a0a" />

      {/* Nez */}
      <path d="M120 158 L114 166 L126 166 Z" fill={palette.accent} />

      {/* Bouche petite */}
      <path d="M115 170 Q120 174, 125 170" stroke="#0a0a0a" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Moustaches */}
      <line x1="80" y1="155" x2="60" y2="152" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="80" y1="162" x2="60" y2="165" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="160" y1="155" x2="180" y2="152" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="160" y1="162" x2="180" y2="165" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" />

      {/* Pattes avant */}
      <ellipse cx="80" cy="220" rx="14" ry="8" fill={palette.body} />
      <ellipse cx="160" cy="220" rx="14" ry="8" fill={palette.body} />
    </g>
  );
}

/// Assignement déterministe d'une combinaison (variant + pose) à partir
/// du nom du chat. Permet d'avoir une illustration stable par chat sans
/// avoir à la stocker en base.
const VARIANTS: CatIllustrationVariant[] = ["cobalt", "paprika", "canari", "feuille"];
const POSES: CatIllustrationPose[] = ["sitting", "sleeping", "standing", "watching"];

export function pickCatIllustration(seed: string): {
  variant: CatIllustrationVariant;
  pose: CatIllustrationPose;
} {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const h = Math.abs(hash);
  return {
    variant: VARIANTS[h % VARIANTS.length],
    pose: POSES[Math.floor(h / VARIANTS.length) % POSES.length],
  };
}
