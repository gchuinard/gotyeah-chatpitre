"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CatReviewStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CAT_REVIEW_OPTIONS } from "@/lib/cat-review";

const SELECT_CLASS =
  "h-10 w-full min-w-0 rounded-md border border-cp-ink bg-cp-paper px-3 font-body text-sm text-cp-ink transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cp-paprika";

/// Contrôle admin de l'avis sur un chat (état + note), posté sur
/// PATCH /api/admin/bookings/[id]/cats/[catId]. Visible aussi côté client.
export function CatReviewControl({
  bookingId,
  catId,
  initialStatus,
  initialNote,
}: {
  bookingId: string;
  catId: string;
  initialStatus: CatReviewStatus;
  initialNote: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<CatReviewStatus>(initialStatus);
  const [note, setNote] = useState(initialNote ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await fetch(
        `/api/admin/bookings/${bookingId}/cats/${catId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewStatus: status,
            reviewNote: note.trim() || undefined,
          }),
        },
      );
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de l'enregistrement.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="mt-3 space-y-2 border-t border-cp-ink/30 pt-3">
      <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.16em] text-cp-cobalt">
        Avis sur ce chat
      </p>
      <select
        aria-label="État du chat pour ce séjour"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as CatReviewStatus);
          setSaved(false);
        }}
        className={SELECT_CLASS}
      >
        {CAT_REVIEW_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Textarea
        aria-label="Note sur le chat"
        rows={2}
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        maxLength={500}
        placeholder="Ex. : RAS · non stérilisé mais à jour de vaccins · refusé : pas identifié"
      />
      <div className="flex items-center gap-3">
        <Button type="button" size="sm" onClick={save} disabled={pending}>
          {pending ? "…" : "Enregistrer l'avis"}
        </Button>
        {saved && !pending && (
          <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-feuille">
            Enregistré ✓
          </span>
        )}
        {error && (
          <span className="font-body text-xs text-cp-paprika">{error}</span>
        )}
      </div>
    </div>
  );
}
