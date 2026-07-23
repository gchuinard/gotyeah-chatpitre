/// Périodes proposées par l'onglet Compta.
///
/// Séparé de lib/accounting.ts pour rester importable par un composant client
/// sans embarquer quoi que ce soit d'autre.

export type PeriodKey = "month" | "year" | "all";

export const PERIOD_LABEL: Record<PeriodKey, string> = {
  month: "Ce mois-ci",
  year: "Cette année",
  all: "Depuis le début",
};

export function resolvePeriod(raw: string | undefined): PeriodKey {
  return raw === "year" || raw === "all" ? raw : "month";
}

/// Bornes d'une période, à partir d'un instant donné.
///
/// `now` est passé en argument plutôt que lu ici : une fonction qui lit
/// l'horloge n'est pas vérifiable, et le rendu d'un composant doit rester pur.
export function periodBounds(
  period: PeriodKey,
  now: Date,
): { from: Date | null; to: Date | null } {
  if (period === "all") return { from: null, to: null };
  if (period === "year") {
    return {
      from: new Date(now.getFullYear(), 0, 1),
      to: new Date(now.getFullYear() + 1, 0, 1),
    };
  }
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
}
