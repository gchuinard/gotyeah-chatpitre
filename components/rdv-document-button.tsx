"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { FilePlus } from "lucide-react";

import { DocumentUploadForm } from "@/components/document-upload-form";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";

const SELECT_CLASS =
  "h-11 w-full min-w-0 rounded-md border border-cp-ink bg-cp-paper px-3 font-body text-base text-cp-ink transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cp-paprika";

type CatOption = { id: string; name: string };

/// Bouton « Ajouter un document » pour la page d'appel : ouvre un dialog
/// (par-dessus la visio, SANS router.refresh) pour téléverser un document vers
/// un chat du séjour. L'appel WebRTC reste monté.
export function RdvDocumentButton({ cats }: { cats: CatOption[] }) {
  const [open, setOpen] = useState(false);
  const [catId, setCatId] = useState(cats[0]?.id ?? "");

  if (cats.length === 0) return null;

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <FilePlus />
        Ajouter un document
      </Button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-cp-ink/40 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Popup className="fixed left-1/2 top-4 z-50 max-h-[calc(100vh-2rem)] w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-0 overflow-y-auto rounded-md border-2 border-cp-ink bg-cp-paper p-6 transition-all duration-200 sm:top-1/2 sm:-translate-y-1/2 sm:p-8 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <Dialog.Title className="font-display text-2xl font-medium leading-tight text-cp-ink">
              Ajouter un document
            </Dialog.Title>
            <Dialog.Description className="mt-2 font-body text-sm leading-relaxed text-cp-ink-soft">
              Il sera ajouté à la fiche du chat (visible par vous et nous),
              sans interrompre l&apos;appel.
            </Dialog.Description>

            <div className="mt-5 space-y-4">
              {cats.length > 1 && (
                <Field label="Chat concerné" htmlFor="rdv-doc-cat">
                  <select
                    id="rdv-doc-cat"
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    className={SELECT_CLASS}
                  >
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <DocumentUploadForm key={catId} catId={catId} refresh={false} embedded />
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Fermer
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
