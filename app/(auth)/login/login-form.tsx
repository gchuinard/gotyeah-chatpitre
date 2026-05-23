"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Field } from "@/components/field";
import { LibraryStamp } from "@/components/library-stamp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/// Formulaire de connexion brutalist editorial : poste vers /api/auth/login
/// puis redirige. L'authentification réelle reste intacte (juste un
/// restylage). Erreur API affichée en sanguine avec marqueur § §.

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    if (res.ok) {
      router.push(next);
      router.refresh();
    } else {
      const data: { error?: string } = await res.json().catch(() => ({}));
      setError(data.error ?? "Identifiants incorrects.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <LibraryStamp tone="cobalt">Accès à votre espace</LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Se connecter
        </h1>
        <p className="max-w-sm font-display text-xl italic leading-snug text-cp-ink-soft">
          Reprenez la main sur vos séjours en cours, vos fiches félines et
          vos échanges avec la maison.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-6">
        <Field
          label="Adresse email"
          htmlFor="login-email"
          required
        >
          <Input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="adresse@maison.fr"
          />
        </Field>

        <Field
          label="Mot de passe"
          htmlFor="login-password"
          required
        >
          <Input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
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
          {loading ? "Connexion…" : "Se connecter →"}
        </Button>
      </form>

      <footer className="border-t border-cp-ink/30 pt-6">
        <p className="font-body text-sm text-cp-ink-soft">
          Pas encore inscrit ?{" "}
          <Link
            href="/signup"
            className="font-medium text-cp-ink underline underline-offset-4 decoration-[1.5px] decoration-cp-ink/40 hover:decoration-cp-paprika hover:text-cp-paprika"
          >
            Créer un compte →
          </Link>
        </p>
      </footer>
    </div>
  );
}
