"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/// Formulaire « maquette » — intercepte le submit pour éviter de
/// rediriger l'utilisateur, vide le form, et affiche un bandeau vert
/// éphémère « action enregistrée — maquette ». Sert de remplacement
/// 1-pour-1 aux `<form action="/..." method="get">` no-op tant que le
/// câblage Prisma/API n'est pas en place.
///
/// `successMessage` peut être personnalisé selon l'action (message
/// envoyé, séjour demandé, séjour accepté…). La className est appliquée
/// au `<form>` interne pour préserver la mise en page d'origine.
///
/// Comportement :
/// - Click submit → preventDefault, reset form, montre la notice
/// - Notice disparaît automatiquement après `dismissAfterMs` (5 s par
///   défaut)
/// - Si on resubmit pendant le délai, la notice reste affichée et le
///   timer est relancé

export function MaquetteForm({
  children,
  className,
  successMessage = "Action enregistrée — maquette, non persistée.",
  dismissAfterMs = 5000,
}: {
  children: ReactNode;
  className?: string;
  successMessage?: string;
  dismissAfterMs?: number;
}) {
  const [showNotice, setShowNotice] = useState(false);
  const [tick, setTick] = useState(0); // pour relancer le timer
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!showNotice) return;
    const timer = window.setTimeout(() => setShowNotice(false), dismissAfterMs);
    return () => window.clearTimeout(timer);
  }, [showNotice, tick, dismissAfterMs]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    formRef.current?.reset();
    setShowNotice(true);
    setTick((t) => t + 1);
  }

  return (
    <div className="space-y-3">
      <form ref={formRef} onSubmit={onSubmit} className={className} noValidate>
        {children}
      </form>
      <MaquetteNotice
        show={showNotice}
        message={successMessage}
        onDismiss={() => setShowNotice(false)}
      />
    </div>
  );
}

/// Variante bouton seul — pour les actions qui n'ont pas de champ à
/// remplir (ex. « Annuler la demande », « Accepter le séjour »). Rend
/// un `<button>` avec la même apparence qu'un `Link` ou `Button`
/// quelconque (className transmise), et déclenche le bandeau au click.
export function MaquetteActionButton({
  children,
  className,
  successMessage,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  successMessage?: string;
  type?: "button" | "submit";
}) {
  const [showNotice, setShowNotice] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!showNotice) return;
    const timer = window.setTimeout(() => setShowNotice(false), 5000);
    return () => window.clearTimeout(timer);
  }, [showNotice, tick]);

  return (
    <>
      <button
        type={type}
        onClick={() => {
          setShowNotice(true);
          setTick((t) => t + 1);
        }}
        className={className}
      >
        {children}
      </button>
      {/* Le notice est portail-isé côté visuel : il s'affiche en bas de
          page sticky pour ne pas perturber la composition. */}
      <MaquetteFloatingNotice
        show={showNotice}
        message={successMessage ?? "Action enregistrée — maquette, non persistée."}
        onDismiss={() => setShowNotice(false)}
      />
    </>
  );
}

function MaquetteNotice({
  show,
  message,
  onDismiss,
}: {
  show: boolean;
  message: string;
  onDismiss: () => void;
}) {
  if (!show) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-between gap-3 rounded-md border border-cp-feuille bg-cp-feuille px-4 py-2.5 font-body text-sm font-semibold text-cp-paper",
      )}
    >
      <span className="flex items-center gap-2">
        <span aria-hidden className="font-bold">
          ✓
        </span>
        {message}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Masquer la notification"
        className="text-cp-paper/85 transition-colors hover:text-cp-canari"
      >
        ✕
      </button>
    </p>
  );
}

function MaquetteFloatingNotice({
  show,
  message,
  onDismiss,
}: {
  show: boolean;
  message: string;
  onDismiss: () => void;
}) {
  if (!show) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md"
    >
      <p className="flex items-center justify-between gap-3 rounded-md border border-cp-feuille bg-cp-feuille px-4 py-3 font-body text-sm font-semibold text-cp-paper shadow-[6px_6px_0_0_var(--color-cp-ink)]">
        <span className="flex items-center gap-2">
          <span aria-hidden className="font-bold">
            ✓
          </span>
          {message}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Masquer la notification"
          className="text-cp-paper/85 transition-colors hover:text-cp-canari"
        >
          ✕
        </button>
      </p>
    </div>
  );
}
