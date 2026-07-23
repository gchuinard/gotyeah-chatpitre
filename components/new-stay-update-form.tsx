"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Cat } from "@prisma/client";

import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/// Formulaire admin pour poster une nouvelle entrée du carnet — sélection des
/// chats concernés, note libre, soumission POST sur l'API. Le variant et la
/// pose de l'illustration sont choisis côté serveur (aléatoires) puisqu'il
/// s'agit d'un placeholder en attendant les vraies photos.
///
/// Plusieurs chats peuvent être cochés : quand deux frères et sœurs du même
/// foyer passent la journée ensemble, la pension écrivait deux fois la même
/// chose. Le serveur crée alors une entrée par chat, si bien que chacun garde
/// un carnet complet et lisible de bout en bout.

export function NewStayUpdateForm({
  bookingId,
  cats,
}: {
  bookingId: string;
  cats: Cat[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  // Tous cochés par défaut : sur un séjour à plusieurs chats, une note du jour
  // les concerne le plus souvent tous. C'est l'exception qu'on décoche.
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>(
    cats.map((c) => c.id),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleCat(catId: string) {
    setSelectedCatIds((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : // On réordonne selon `cats` plutôt que d'ajouter en fin de liste :
          // l'ordre reste celui affiché, quel que soit l'ordre des clics.
          cats.filter((c) => c.id === catId || prev.includes(c.id)).map((c) => c.id),
    );
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const content = String(formData.get("content") ?? "").trim();
    if (!content) return;
    if (selectedCatIds.length === 0) {
      setError("Sélectionnez au moins un chat.");
      return;
    }

    startTransition(async () => {
      const res = await fetch(
        `/api/admin/bookings/${bookingId}/stay-updates`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            catIds: selectedCatIds,
            content,
          }),
        },
      );
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de la publication.");
        return;
      }
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="space-y-4 rounded-md border border-cp-cobalt bg-cp-cobalt p-6 text-cp-paper sm:p-8"
      noValidate
    >
      <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-cp-canari">
        Nouvelle entrée du carnet
      </p>

      {/* Aucun sélecteur sur un séjour à un seul chat : rien ne change pour le
          cas le plus courant. */}
      {cats.length > 1 && (
        <div className="space-y-2">
          <p
            id="journal-cats-label"
            className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-paper/70"
          >
            Au sujet de
          </p>
          <div
            role="group"
            aria-labelledby="journal-cats-label"
            className="flex flex-wrap items-center gap-2"
          >
            {cats.map((cat) => {
              const selected = selectedCatIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  // aria-pressed et non un simple bouton : plusieurs choix
                  // coexistent désormais, un lecteur d'écran doit pouvoir dire
                  // lesquels sont cochés.
                  aria-pressed={selected}
                  onClick={() => toggleCat(cat.id)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 font-body text-sm font-semibold transition-colors",
                    selected
                      ? "border-cp-canari bg-cp-canari text-cp-ink"
                      : "border-cp-paper/40 bg-transparent text-cp-paper hover:border-cp-paper",
                  )}
                >
                  {cat.name}
                </button>
              );
            })}
            {/* Raccourci « tous », utile après avoir décoché : sans lui il faut
                recocher chaque chat un par un. Masqué quand tous le sont
                déjà, où il ne ferait rien. */}
            {selectedCatIds.length < cats.length && (
              <button
                type="button"
                onClick={() => setSelectedCatIds(cats.map((c) => c.id))}
                className="rounded-md px-3 py-1.5 font-body text-sm font-semibold text-cp-canari underline underline-offset-4 transition-colors hover:text-cp-paper"
              >
                Tous
              </button>
            )}
          </div>
        </div>
      )}

      <Field label="Note du jour" htmlFor="journal-content">
        <Textarea
          id="journal-content"
          name="content"
          rows={3}
          placeholder="Salami a dormi sur le frigo toute la matinée…"
          className="border-cp-paper/30 bg-cp-cobalt-deep text-cp-paper placeholder:text-cp-paper/40 focus-visible:outline-cp-canari"
          disabled={pending}
        />
      </Field>

      <p className="font-body text-xs italic text-cp-paper/70">
        Photo réelle à venir, pour l&apos;instant le carnet pioche une
        illustration de chat au hasard.
      </p>

      <div className="flex items-center justify-end gap-4">
        {error && (
          <p className="font-body text-xs text-cp-canari">{error}</p>
        )}
        <Button
          type="submit"
          size="default"
          disabled={pending}
          className="border-cp-canari bg-cp-canari text-cp-ink hover:bg-cp-canari-deep hover:border-cp-canari-deep"
        >
          {pending ? "Publication…" : "Publier l'entrée →"}
        </Button>
      </div>
    </form>
  );
}
