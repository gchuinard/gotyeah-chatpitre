"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/// Marque un chat comme disparu, ou revient sur ce marquage.
///
/// Rien n'est effacé : la fiche, le carnet et l'historique des séjours restent
/// lisibles. C'est même ce qui reste au propriétaire, et c'est pourquoi on ne
/// lui propose pas de supprimer.
///
/// Le ton est tenu court sur tout cet écran. Pas d'emoji, pas de couleur
/// festive, pas de formule enjouée : c'est le moment le plus délicat de
/// l'application.

export function CatMemorialControl({
  catId,
  catName,
  passedAway,
}: {
  catId: string;
  catName: string;
  passedAway: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send(value: boolean) {
    setError(null);
    startTransition(async () => {
      let res: Response;
      try {
        res = await fetch(`/api/cats/${catId}/memorial`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passedAway: value }),
        });
      } catch {
        setError("Échec de l'enregistrement, réessayez.");
        return;
      }
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de l'enregistrement.");
        return;
      }
      router.refresh();
    });
  }

  // Déjà marqué : on n'offre que le retour en arrière, sans confirmation.
  // Défaire une erreur de manipulation ne doit rien coûter.
  if (passedAway) {
    return (
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => send(false)}
        >
          Retirer ce marquage
        </Button>
        {error && <p className="font-body text-sm text-cp-paprika">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        Signaler la disparition de {catName}
      </Button>
      {error && <p className="font-body text-sm text-cp-paprika">{error}</p>}

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Signaler la disparition de ${catName}`}
        // Dit d'abord ce qui est CONSERVÉ. C'est la question qu'on se pose à ce
        // moment-là, et la réponse rassure avant de valider.
        description="Sa fiche, son carnet et l'historique de ses séjours sont conservés. Il ne sera simplement plus proposé pour un nouveau séjour. Vous pourrez revenir sur ce choix."
        confirmLabel="Confirmer"
        cancelLabel="Annuler"
        onConfirm={() => send(true)}
      />
    </div>
  );
}
