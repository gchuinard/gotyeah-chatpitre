"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Field } from "@/components/field";
import { LibraryStamp } from "@/components/library-stamp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/// Formulaire d'inscription brutalist editorial : poste vers /api/auth/signup,
/// ouvre directement la session, redirige vers /dashboard. Confirmation de
/// mot de passe ajoutée (validation client pure : on n'envoie qu'un seul
/// password à l'API).

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setConfirmError(null);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const passwordConfirm = String(form.get("passwordConfirm") ?? "");

    if (password !== passwordConfirm) {
      setConfirmError(
        "La confirmation ne correspond pas au mot de passe ci-dessus.",
      );
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password,
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        phone: form.get("phone") || undefined,
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data: { error?: string } = await res.json().catch(() => ({}));
      setError(data.error ?? "Échec de l'inscription.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <LibraryStamp tone="paprika">Ouverture d&apos;une fiche</LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Créer un compte
        </h1>
        <p className="max-w-sm font-display text-xl italic leading-snug text-cp-ink-soft">
          Ouvrez votre fiche personnelle. Vous pourrez ensuite inscrire vos
          chats et demander des séjours.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Prénom" htmlFor="signup-firstname" required>
            <Input
              id="signup-firstname"
              name="firstName"
              required
              autoComplete="given-name"
              placeholder="Madame"
            />
          </Field>
          <Field label="Nom" htmlFor="signup-lastname" required>
            <Input
              id="signup-lastname"
              name="lastName"
              required
              autoComplete="family-name"
              placeholder="Cliquot"
            />
          </Field>
        </div>

        <Field label="Adresse email" htmlFor="signup-email" required>
          <Input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="adresse@maison.fr"
          />
        </Field>

        <Field
          label="Mot de passe"
          htmlFor="signup-password"
          required
          hint="Huit caractères minimum."
        >
          <Input
            id="signup-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </Field>

        <Field
          label="Confirmation du mot de passe"
          htmlFor="signup-password-confirm"
          required
          error={confirmError ?? undefined}
        >
          <Input
            id="signup-password-confirm"
            name="passwordConfirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            aria-invalid={confirmError ? "true" : undefined}
          />
        </Field>

        <Field
          label="Téléphone"
          htmlFor="signup-phone"
          hint="Facultatif, joignable pour les urgences."
        >
          <Input
            id="signup-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="06 12 34 56 78"
          />
        </Field>

        {error && (
          <p
            role="alert"
            className="flex items-baseline gap-2 border border-cp-paprika bg-cp-paprika/8 px-4 py-3 font-body text-sm text-cp-paprika"
          >
            <span aria-hidden className="font-mono font-bold">
              §§
            </span>
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? "Création…" : "Créer mon compte"}
        </Button>
      </form>

      {/* Même traitement que le renvoi de la connexion : pied discret sous le
          formulaire, et non l'encadré plein en tête de page qu'il y avait ici.
          Les deux écrans se répondent maintenant, et l'inscription gagne au
          passage la hauteur que cet encadré prenait avant le titre. */}
      <footer className="border-t border-cp-ink/30 pt-6">
        <p className="font-body text-sm text-cp-ink-soft">
          Vous avez déjà un compte&nbsp;?{" "}
          <Link
            href="/login"
            className="font-medium text-cp-ink underline underline-offset-4 decoration-[1.5px] decoration-cp-ink/40 hover:decoration-cp-paprika hover:text-cp-paprika"
          >
            Se connecter →
          </Link>
        </p>
      </footer>
    </div>
  );
}
