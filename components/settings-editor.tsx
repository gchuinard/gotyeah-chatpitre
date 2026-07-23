"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SETTINGS, type SettingKey } from "@/lib/settings";

/// Éditeur des réglages de la pension.
///
/// Le formulaire est engendré à partir du registre de lib/settings.ts : ajouter
/// une clé là-bas suffit à la voir apparaître ici, avec son libellé, son type
/// de champ et sa validation. Rien à retoucher dans cet écran.

/// Regroupements, dans l'ordre où ils s'affichent.
const GROUPS = ["Tarifs", "Horaires d'accueil"] as const;

export function SettingsEditor({
  initial,
}: {
  initial: Record<SettingKey, string>;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirty = SETTINGS.some((s) => values[s.key] !== initial[s.key]);

  function save() {
    setError(null);
    setFieldErrors({});
    setSaved(false);

    // On n'envoie QUE ce qui a changé : réécrire les sept clés à chaque
    // enregistrement produirait des écritures inutiles et masquerait, dans
    // l'historique, ce que la pension a réellement modifié.
    const changed: Record<string, string> = {};
    for (const s of SETTINGS) {
      if (values[s.key] !== initial[s.key]) changed[s.key] = values[s.key];
    }

    startTransition(async () => {
      let res: Response;
      try {
        res = await fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changed),
        });
      } catch {
        setError("Échec de l'enregistrement, réessayez.");
        return;
      }
      if (!res.ok) {
        const data: { error?: string; fields?: Record<string, string> } = await res
          .json()
          .catch(() => ({}));
        setFieldErrors(data.fields ?? {});
        setError(data.error ?? "Échec de l'enregistrement.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      {GROUPS.map((group) => (
        <section key={group} className="space-y-5">
          <h2 className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-cp-paprika">
            {group}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {SETTINGS.filter((s) => s.group === group).map((s) => (
              <label key={s.key} className="space-y-1.5">
                <span className="block font-body text-sm font-medium text-cp-ink">
                  {s.label}
                </span>
                <Input
                  type={s.kind === "time" ? "time" : "number"}
                  inputMode={s.kind === "time" ? undefined : "decimal"}
                  step={s.kind === "percent" ? 1 : s.kind === "euros" ? 0.5 : undefined}
                  min={s.kind === "time" ? undefined : 0}
                  max={s.kind === "percent" ? 100 : undefined}
                  value={values[s.key]}
                  aria-invalid={fieldErrors[s.key] ? true : undefined}
                  disabled={pending}
                  onChange={(e) =>
                    setValues({ ...values, [s.key]: e.target.value })
                  }
                />
                {/* Le suffixe est porté par le libellé d'aide et non collé dans
                    le champ : un « € » dans la valeur casserait la saisie. */}
                <span className="block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-cp-ink-soft">
                  {s.kind === "euros" ? "en euros" : s.kind === "percent" ? "en %" : "HH:MM"}
                </span>
                {fieldErrors[s.key] && (
                  <span className="block font-body text-xs text-cp-paprika">
                    {fieldErrors[s.key]}
                  </span>
                )}
              </label>
            ))}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-4 border-t border-cp-ink/30 pt-6">
        <Button type="button" disabled={pending || !dirty} onClick={save}>
          {pending ? "Enregistrement…" : "Enregistrer les réglages"}
        </Button>
        {error && <p className="font-body text-sm text-cp-paprika">{error}</p>}
        {saved && !error && (
          <p className="font-body text-sm text-cp-ink-soft">Réglages enregistrés.</p>
        )}
      </div>

      {/* Dit ce que l'enregistrement ne fait PAS. Sans cette phrase, on peut
          craindre qu'augmenter un tarif refacture les séjours déjà acceptés. */}
      <p className="font-body text-sm text-cp-ink-soft">
        Les séjours déjà chiffrés gardent leur tarif : ces réglages ne
        s&apos;appliquent qu&apos;aux devis posés ensuite.
      </p>
    </div>
  );
}
