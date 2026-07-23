"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { PHOTO_MAX_MB, PHOTO_MIME_TYPES } from "@/lib/cat-photos";
import { cn } from "@/lib/utils";

/// Dépôt de photos par la pension, depuis la fiche du séjour.
///
/// Plusieurs fichiers à la fois : on prend rarement une seule photo d'un chat,
/// et déposer image par image serait décourageant.

export function PhotoUpload({
  bookingId,
  cats,
}: {
  bookingId: string;
  cats: { id: string; name: string }[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [catId, setCatId] = useState(cats[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send(files: FileList) {
    setError(null);
    const form = new FormData();
    form.set("catId", catId);
    for (const f of Array.from(files)) form.append("files", f);

    startTransition(async () => {
      let res: Response;
      try {
        res = await fetch(`/api/admin/bookings/${bookingId}/photos`, {
          method: "POST",
          body: form,
        });
      } catch {
        setError("Échec de l'envoi, réessayez.");
        return;
      }
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de l'envoi.");
        return;
      }
      // Vide le champ, sinon redéposer les mêmes fichiers ne déclencherait
      // aucun événement de changement.
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 rounded-md border border-cp-ink/25 p-5">
      <div className="space-y-1">
        <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-cp-paprika">
          Photos du séjour
        </p>
        <p className="font-body text-sm text-cp-ink-soft">
          Le client est prévenu à chaque dépôt. {PHOTO_MAX_MB} Mo par photo.
        </p>
      </div>

      {/* Aucun sélecteur sur un séjour à un seul chat. */}
      {cats.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={c.id === catId}
              onClick={() => setCatId(c.id)}
              className={cn(
                "rounded-md border px-3 py-1.5 font-body text-sm font-semibold transition-colors",
                c.id === catId
                  ? "border-cp-paprika bg-cp-paprika text-cp-paper"
                  : "border-cp-ink/25 text-cp-ink hover:border-cp-ink",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_MIME_TYPES.join(",")}
        multiple
        disabled={pending}
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) send(files);
        }}
        className="block w-full font-body text-sm text-cp-ink file:mr-4 file:rounded-md file:border file:border-cp-ink file:bg-cp-paper-deep file:px-4 file:py-2 file:font-body file:text-sm file:font-semibold file:text-cp-ink hover:file:bg-cp-paper"
      />

      <div className="flex flex-wrap items-center gap-3">
        {pending && (
          <p className="font-body text-sm text-cp-ink-soft">Envoi en cours…</p>
        )}
        {error && <p className="font-body text-sm text-cp-paprika">{error}</p>}
        {/* Bouton de secours : sur certains navigateurs mobiles, le champ de
            fichier natif est peu visible. */}
        {!pending && !error && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Choisir des photos
          </Button>
        )}
      </div>
    </div>
  );
}
