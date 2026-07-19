"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/// Marque un séjour comme « tâche à faire » et y attache un mot.
///
/// C'est l'ancienne épingle, devenue une vraie note. Une épingle nue disait
/// seulement « revenez ici » sans dire pourquoi : au bout de trois séjours
/// épinglés, l'information était perdue. La note voyage jusqu'au tableau de
/// bord et s'y affiche en clair, ce qui rend la file « À traiter » lisible sans
/// ouvrir chaque fiche.
///
/// En base le drapeau reste `pinnedForAdmin` et la note `pinnedNote` : seul le
/// vocabulaire visible a changé, pas les colonnes.

/// Doit tenir sur une ligne de tableau : au-delà, ce n'est plus un pense-bête,
/// c'est un message, et sa place est dans le fil.
export const TASK_NOTE_MAX = 200;

export function BookingTaskControl({
  bookingId,
  active,
  note,
}: {
  bookingId: string;
  active: boolean;
  note: string | null;
}) {
  const router = useRouter();
  const [savedNote, setSavedNote] = useState(note);
  const [draft, setDraft] = useState(note ?? "");
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  // Après enregistrement la page se rafraîchit et renvoie la note du serveur.
  // On réaligne le brouillon dessus, sinon le champ garderait une copie qui
  // finirait par diverger de ce qui est réellement enregistré.
  if (note !== savedNote) {
    setSavedNote(note);
    setDraft(note ?? "");
  }

  const trimmed = draft.trim();
  const dirty = trimmed !== (note ?? "");

  function send(payload: { pinned: boolean; note?: string }) {
    setError(false);
    startTransition(async () => {
      let ok = false;
      try {
        const res = await fetch(`/api/admin/bookings/${bookingId}/pin`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        ok = res.ok;
      } catch {
        ok = false;
      }
      if (!ok) {
        setError(true);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "space-y-3 rounded-md border p-5",
        active ? "border-cp-paprika bg-cp-paprika/5" : "border-cp-ink/25",
      )}
    >
      <div className="space-y-1">
        <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-cp-paprika">
          Tâche à faire
        </p>
        <p className="font-body text-sm text-cp-ink-soft">
          {active
            ? "Ce séjour reste en tête de la file « À traiter », avec ce mot affiché."
            : "Gardez ce séjour dans la file « À traiter » et notez ce qu'il reste à régler."}
        </p>
      </div>

      <Textarea
        id={`task-note-${bookingId}`}
        rows={2}
        // Le Textarea part à min-h-28, trop haut pour deux lignes de pense-bête.
        className="min-h-20"
        maxLength={TASK_NOTE_MAX}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="Ce qu'il reste à faire sur ce séjour"
        placeholder="La personne demande si elle peut déposer son chat à 9h, à confirmer avec Camille."
      />

      <div className="flex flex-wrap items-center gap-3">
        {active ? (
          <>
            {dirty && (
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() => send({ pinned: true, note: trimmed })}
              >
                Enregistrer le mot
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => send({ pinned: false })}
            >
              Tâche réglée
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() => send({ pinned: true, note: trimmed })}
          >
            Marquer une tâche à faire
          </Button>
        )}

        <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-cp-ink-soft">
          {error
            ? "Échec de l'enregistrement, réessayez."
            : `${draft.length} / ${TASK_NOTE_MAX}`}
        </p>
      </div>
    </div>
  );
}
