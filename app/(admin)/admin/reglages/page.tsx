import Link from "next/link";

import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { SettingsEditor } from "@/components/settings-editor";
import { readSettings } from "@/lib/repository";

/// Réglages de la pension : tarifs et créneaux d'accueil.
///
/// Ces valeurs vivaient déjà dans la table Setting, mais aucun écran ne
/// permettait de les modifier : changer le prix d'une nuit supposait d'écrire
/// directement en base, sur un serveur joignable seulement en SSH.

export default async function AdminSettingsPage() {
  const settings = await readSettings();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/admin" className="hover:text-cp-paprika">
          Administration
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Réglages</span>
      </nav>

      <header className="space-y-5">
        <LibraryStamp boxed>Réglages de la maison</LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Tarifs et horaires.
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          Ce qui s&apos;applique par défaut à tout nouveau séjour.
        </p>
      </header>

      <RuleDivider className="my-12" tone="paprika" />

      <SettingsEditor initial={settings} />
    </div>
  );
}
