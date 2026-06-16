"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Le bouton « Rejoindre » s'ouvre autour de l'heure du créneau : dès 10 min
// avant, jusqu'à 15 min après la fin prévue.
const OPEN_BEFORE_MS = 10 * 60_000;
const CLOSE_AFTER_MS = 15 * 60_000;

/// Bouton « Rejoindre l'appel » qui s'active autour de l'heure du rendez-vous.
/// Évalué côté client (re-vérifié toutes les 30 s) pour s'activer sans recharger.
export function RdvJoinButton({
  href,
  scheduledAt,
  durationMin,
}: {
  href: string;
  scheduledAt: string; // ISO
  durationMin: number;
}) {
  const start = new Date(scheduledAt).getTime();
  const opensAt = start - OPEN_BEFORE_MS;
  const closesAt = start + durationMin * 60_000 + CLOSE_AFTER_MS;

  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // Premier tick au prochain macrotask (hors corps synchrone de l'effet),
    // puis ré-évaluation toutes les 30 s pour s'activer sans recharger.
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(Date.now());
      timer = setTimeout(tick, 30_000);
    };
    timer = setTimeout(tick, 0);
    return () => clearTimeout(timer);
  }, []);

  // Avant hydratation : état neutre, pas de mismatch SSR/CSR.
  if (now === null) {
    return (
      <span
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "pointer-events-none opacity-60",
        )}
      >
        Rejoindre
      </span>
    );
  }

  if (now >= opensAt && now <= closesAt) {
    return (
      <Link href={href} className={buttonVariants({ variant: "default", size: "sm" })}>
        Rejoindre l&apos;appel
      </Link>
    );
  }

  return (
    <span
      aria-disabled
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "pointer-events-none opacity-60",
      )}
    >
      {now > closesAt ? "Créneau passé" : "Bientôt disponible"}
    </span>
  );
}
