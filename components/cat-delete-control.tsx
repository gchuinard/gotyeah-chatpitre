"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/// Supprime la fiche d'un chat déclaré par erreur.
///
/// Ne s'affiche QUE si le chat n'a jamais séjourné. Un chat qui a séjourné ne
/// peut pas être supprimé, la base l'interdit pour ne pas casser l'historique
/// et les factures ; proposer un bouton qui échoue à coup sûr serait une
/// promesse en l'air.
///
/// Ce geste n'a rien à voir avec la perte d'un animal : on ne demande pas à
/// quelqu'un dont le chat est mort d'effacer sa fiche. Ce cas-là relève du
/// marquage « disparu », qui conserve tout.

export function CatDeleteControl({
  catId,
  catName,
  hasStayed,
}: {
  catId: string;
  catName: string;
  /// Vrai dès qu'un séjour, même annulé, référence ce chat.
  hasStayed: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (hasStayed) return null;

  function remove() {
    setError(null);
    startTransition(async () => {
      let res: Response;
      try {
        res = await fetch(`/api/cats/${catId}`, { method: "DELETE" });
      } catch {
        setError("Échec de la suppression, réessayez.");
        return;
      }
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de la suppression.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
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
        Supprimer cette fiche
      </Button>
      {error && <p className="font-body text-sm text-cp-paprika">{error}</p>}

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Supprimer la fiche de ${catName} ?`}
        // Dit ce qui disparaît, et que c'est définitif. Le propriétaire doit
        // savoir que les documents partent avec.
        description="La fiche et les documents qui y sont rattachés seront définitivement effacés. Cette action est irréversible."
        confirmLabel="Supprimer la fiche"
        cancelLabel="Annuler"
        confirmVariant="destructive"
        onConfirm={remove}
      />
    </div>
  );
}
