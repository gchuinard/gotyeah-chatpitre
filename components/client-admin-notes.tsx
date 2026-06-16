"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/// Éditeur de la note interne admin d'un client (PATCH /api/admin/clients/[id]).
/// Visible et modifiable uniquement côté maison.
export function ClientAdminNotes({
  clientId,
  initialNotes,
}: {
  clientId: string;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: notes.trim() || null }),
      });
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
    <div className="space-y-3">
      <Textarea
        aria-label="Note interne sur le client"
        rows={4}
        value={notes}
        maxLength={2000}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        placeholder="Ex. : préfère être appelé le soir · règle en espèces · chat craintif chez le véto…"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" onClick={save} disabled={pending}>
          {pending ? "…" : "Enregistrer la note"}
        </Button>
        {saved && !pending && (
          <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-feuille">
            Enregistré ✓
          </span>
        )}
        {error && <span className="font-body text-xs text-cp-paprika">{error}</span>}
      </div>
    </div>
  );
}
