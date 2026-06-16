"use client";

import { useRef, useState, useTransition } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { DocumentType } from "@prisma/client";

import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DOCUMENT_TYPE_OPTIONS,
  guessTypeFromFilename,
  MAX_UPLOAD_MB,
} from "@/lib/cat-documents";

const SELECT_CLASS =
  "h-11 w-full min-w-0 rounded-md border border-cp-ink bg-cp-paper px-3 font-body text-base text-cp-ink transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cp-paprika";

const FILE_INPUT_CLASS =
  "w-full cursor-pointer rounded-md border border-cp-ink bg-cp-paper px-3 py-2 font-body text-sm text-cp-ink file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:bg-cp-ink file:px-3 file:py-1.5 file:font-mono file:text-xs file:font-bold file:uppercase file:tracking-wider file:text-cp-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cp-paprika";

/// Formulaire de téléversement d'un document pour un chat. Poste en multipart
/// vers /api/cats/[id]/documents. Le type est pré-sélectionné depuis le nom du
/// fichier (le client peut le corriger). Réutilisé sur la fiche et dans la visio.
export function DocumentUploadForm({
  catId,
  onUploaded,
  refresh = true,
}: {
  catId: string;
  onUploaded?: () => void;
  // refresh=false depuis la visio : éviter router.refresh qui re-rendrait la
  // page d'appel (l'îlot WebRTC doit rester monté).
  refresh?: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<DocumentType>("VACCINATION");
  const [customLabel, setCustomLabel] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setDone(false);
    const file = e.target.files?.[0];
    if (!file) return;
    const guess = guessTypeFromFilename(file.name);
    if (guess) setType(guess);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choisissez un fichier.");
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${MAX_UPLOAD_MB} Mo).`);
      return;
    }
    if (type === "OTHER" && !customLabel.trim()) {
      setError("Indiquez un libellé pour le type « Autre ».");
      return;
    }

    const fd = new FormData();
    fd.set("file", file);
    fd.set("type", type);
    if (type === "OTHER") fd.set("customLabel", customLabel.trim());
    if (documentDate) fd.set("documentDate", documentDate);

    startTransition(async () => {
      // Pas de Content-Type manuel : le navigateur pose le boundary multipart.
      const res = await fetch(`/api/cats/${catId}/documents`, { method: "POST", body: fd });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec du téléversement.");
        return;
      }
      if (fileRef.current) fileRef.current.value = "";
      setCustomLabel("");
      setDocumentDate("");
      setType("VACCINATION");
      setDone(true);
      onUploaded?.();
      if (refresh) router.refresh();
    });
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-md border border-cp-ink bg-cp-paper p-5 sm:grid-cols-2 sm:p-6"
    >
      <Field label="Fichier (image ou PDF)" htmlFor="doc-file" required className="sm:col-span-2">
        <input
          ref={fileRef}
          id="doc-file"
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif,application/pdf,.heic,.heif"
          onChange={onPickFile}
          className={FILE_INPUT_CLASS}
        />
      </Field>
      <Field label="Type de document" htmlFor="doc-type">
        <select
          id="doc-type"
          value={type}
          onChange={(e) => setType(e.target.value as DocumentType)}
          className={SELECT_CLASS}
        >
          {DOCUMENT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Date du document (optionnel)" htmlFor="doc-date">
        <Input
          id="doc-date"
          type="date"
          value={documentDate}
          onChange={(e) => setDocumentDate(e.target.value)}
        />
      </Field>
      {type === "OTHER" && (
        <Field label="Libellé" htmlFor="doc-label" required className="sm:col-span-2">
          <Input
            id="doc-label"
            value={customLabel}
            maxLength={120}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Ex. : résultat de prise de sang"
          />
        </Field>
      )}
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Envoi…" : "Téléverser le document"}
        </Button>
        {done && !pending && (
          <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-feuille">
            Ajouté ✓
          </span>
        )}
        {error && <span className="font-body text-xs text-cp-paprika">{error}</span>}
      </div>
    </form>
  );
}
