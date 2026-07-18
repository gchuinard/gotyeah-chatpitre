"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Cat } from "@prisma/client";

import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/// Formulaire admin pour poster une nouvelle entrée du carnet — sélection
/// du chat concerné, note libre, soumission POST sur l'API. Le variant
/// et la pose de l'illustration sont choisis côté serveur (aléatoires)
/// puisqu'il s'agit d'un placeholder en attendant les vraies photos.

export function NewStayUpdateForm({
  bookingId,
  cats,
}: {
  bookingId: string;
  cats: Cat[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedCatId, setSelectedCatId] = useState<string>(cats[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const content = String(formData.get("content") ?? "").trim();
    if (!content) return;

    startTransition(async () => {
      const res = await fetch(
        `/api/admin/bookings/${bookingId}/stay-updates`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            catId: selectedCatId,
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

      {cats.length > 1 && (
        <div className="space-y-2">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-paper/70">
            Au sujet de
          </p>
          <div className="flex flex-wrap gap-2">
            {cats.map((cat) => {
              const selected = cat.id === selectedCatId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCatId(cat.id)}
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
