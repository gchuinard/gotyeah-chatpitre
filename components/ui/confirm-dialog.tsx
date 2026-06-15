"use client";

import { Dialog } from "@base-ui/react/dialog";

import { Button } from "@/components/ui/button";

/// Boîte de confirmation aux couleurs du site (remplace window.confirm).
/// Contrôlée : le parent gère `open` et fournit l'action `onConfirm`.
/// Fermeture par Échap, clic sur le fond, « Annuler » ou après confirmation.

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  confirmVariant = "default",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive" | "secondary";
  onConfirm: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-cp-ink/40 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-cp-ink bg-cp-paper p-6 transition-all duration-200 sm:p-8 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <Dialog.Title className="font-display text-2xl font-medium leading-tight text-cp-ink">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="mt-3 font-body text-sm leading-relaxed text-cp-ink-soft">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-7 flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
