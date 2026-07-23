"use client";

import { useState } from "react";

import { CatIllustration } from "@/components/cat-illustration";
import {
  AVATARS,
  avatarKey,
  avatarLabel,
  type Avatar,
} from "@/lib/cat-avatar";
import { cn } from "@/lib/utils";

/// Choix de l'avatar d'un chat, parmi les seize illustrations du projet.
///
/// Rendu comme une grille de boutons radio : un seul choix possible, la
/// navigation au clavier fonctionne, et chaque option porte un nom lisible
/// (« Chat vert, endormi ») plutôt qu'un identifiant.
///
/// La valeur voyage dans un champ caché : le formulaire de la fiche chat
/// s'envoie par FormData, ce qui évite de remonter un état jusqu'à lui.

export function CatAvatarPicker({
  name = "avatarKey",
  defaultValue,
  catName,
}: {
  name?: string;
  defaultValue?: string | null;
  /// Sert uniquement à l'aperçu par défaut quand rien n'est choisi.
  catName?: string;
}) {
  const [selected, setSelected] = useState<string | null>(defaultValue ?? null);

  return (
    <fieldset className="space-y-3">
      <legend className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
        Avatar
      </legend>
      <p className="font-body text-sm text-cp-ink-soft">
        Facultatif. Sans choix, une illustration est tirée à partir du nom
        {catName ? ` de ${catName}` : ""}.
      </p>

      <input type="hidden" name={name} value={selected ?? ""} />

      <div
        role="radiogroup"
        aria-label="Choisir un avatar"
        className="grid grid-cols-4 gap-2 sm:grid-cols-8"
      >
        {AVATARS.map((a: Avatar) => {
          const key = avatarKey(a);
          const isSelected = key === selected;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={avatarLabel(a)}
              title={avatarLabel(a)}
              // Un clic sur l'avatar déjà choisi le retire : c'est le seul
              // moyen de revenir à l'illustration tirée du nom sans recharger.
              onClick={() => setSelected(isSelected ? null : key)}
              className={cn(
                "overflow-hidden rounded-md border-2 transition-colors",
                isSelected
                  ? "border-cp-paprika"
                  : "border-cp-ink/20 hover:border-cp-ink",
              )}
            >
              <CatIllustration
                variant={a.variant}
                pose={a.pose}
                ariaLabel=""
                className="aspect-square w-full"
              />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
