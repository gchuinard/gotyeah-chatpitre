"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Star, Trash2 } from "lucide-react";
import type { DocumentType } from "@prisma/client";

import { DocumentUploadForm } from "@/components/document-upload-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DOCUMENT_TYPE_BADGE,
  DOCUMENT_TYPE_LABEL,
  formatFileSize,
  isImageMime,
} from "@/lib/cat-documents";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CatDocumentItem = {
  id: string;
  type: DocumentType;
  customLabel: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedByLabel: string | null;
  documentDate: string | null; // ISO
};

/// Section Documents d'une fiche chat : liste (vignette + badge de type +
/// actions voir/télécharger/portrait/supprimer) + formulaire d'ajout.
export function CatDocuments({
  catId,
  documents,
}: {
  catId: string;
  documents: CatDocumentItem[];
}) {
  const router = useRouter();
  const [toDelete, setToDelete] = useState<CatDocumentItem | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function confirmDelete() {
    const doc = toDelete;
    if (!doc) return;
    setError(null);
    setPendingId(doc.id);
    startTransition(async () => {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      setPendingId(null);
      if (!res.ok) {
        setError("Échec de la suppression.");
        return;
      }
      router.refresh();
    });
  }

  function setAsPortrait(doc: CatDocumentItem) {
    setError(null);
    setPendingId(doc.id);
    startTransition(async () => {
      const res = await fetch(`/api/documents/${doc.id}/portrait`, { method: "POST" });
      setPendingId(null);
      if (!res.ok) {
        setError("Échec de la mise à jour du portrait.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="space-y-6">
      {documents.length === 0 ? (
        <p className="font-display text-lg italic text-cp-mute">
          Aucun document pour l&apos;instant.
        </p>
      ) : (
        <ul className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink">
          {documents.map((doc) => {
            const label =
              doc.type === "OTHER" && doc.customLabel
                ? doc.customLabel
                : DOCUMENT_TYPE_LABEL[doc.type];
            const isImage = isImageMime(doc.mimeType);
            const busy = pendingId === doc.id;
            return (
              <li key={doc.id} className="flex flex-wrap items-center gap-4 bg-cp-paper p-4">
                <a
                  href={`/api/documents/${doc.id}`}
                  target="_blank"
                  rel="noopener"
                  className="shrink-0"
                  aria-label={`Ouvrir ${label}`}
                >
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/documents/${doc.id}`}
                      alt={label}
                      className="size-16 rounded-md border border-cp-ink object-cover"
                    />
                  ) : (
                    <span className="grid size-16 place-items-center rounded-md border border-cp-ink bg-cp-paper-deep text-cp-ink-soft">
                      <FileText />
                    </span>
                  )}
                </a>

                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex max-w-full items-center truncate rounded-full border px-2.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] ${DOCUMENT_TYPE_BADGE[doc.type]}`}
                  >
                    {label}
                  </span>
                  <p className="mt-1 truncate font-body text-sm text-cp-ink">{doc.originalName}</p>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-cp-mute">
                    {formatFileSize(doc.sizeBytes)}
                    {doc.documentDate ? ` · ${formatDate(new Date(doc.documentDate))}` : ""}
                    {doc.uploadedByLabel ? ` · ${doc.uploadedByLabel}` : ""}
                  </p>
                </div>

                <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
                  <a
                    href={`/api/documents/${doc.id}?download=1`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-11")}
                  >
                    Télécharger
                  </a>
                  {isImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Définir comme portrait du chat"
                      title="Définir comme portrait"
                      onClick={() => setAsPortrait(doc)}
                      disabled={busy}
                    >
                      <Star />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer le document"
                    onClick={() => setToDelete(doc)}
                    disabled={busy}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="font-body text-xs text-cp-paprika">{error}</p>}

      <DocumentUploadForm catId={catId} />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
        title="Supprimer ce document ?"
        description="Le fichier sera définitivement supprimé de la fiche du chat."
        confirmLabel="Supprimer"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      />
    </section>
  );
}
