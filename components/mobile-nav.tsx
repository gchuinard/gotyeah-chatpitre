"use client";

import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { Menu as MenuIcon, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

/// Menu de navigation mobile pour les pages publiques. Bouton hamburger
/// déclencheur visible sous lg ; ouvre un Dialog Base UI plein-écran
/// avec la nav verticale + CTA. Fermeture sur escape, clic backdrop,
/// ou clic sur un lien (Base UI ne le fait pas automatiquement pour
/// les <a> rendus par Next/Link — on gère via onClick).

export type MobileNavLink = { href: string; label: string };

export function MobileNav({
  actionLinks,
  presentationLinks,
}: {
  actionLinks: MobileNavLink[];
  presentationLinks: MobileNavLink[];
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        aria-label="Ouvrir le menu"
        className="grid size-10 place-items-center rounded-md border border-cp-ink/40 bg-cp-paper text-cp-ink outline-none transition-colors hover:border-cp-cobalt hover:bg-cp-cobalt hover:text-cp-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cp-paprika lg:hidden"
      >
        <MenuIcon className="size-5" strokeWidth={2} aria-hidden />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-cp-ink/40 backdrop-blur-sm data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-200" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex h-full w-[min(22rem,90vw)] flex-col gap-8 overflow-y-auto border-l-2 border-cp-ink bg-cp-paper p-6 outline-none data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full transition-transform duration-300 sm:p-8">
          <header className="flex items-center justify-between gap-4">
            <Wordmark className="text-xl" />
            <Dialog.Close
              aria-label="Fermer le menu"
              className="grid size-10 place-items-center rounded-md border border-cp-ink/40 bg-cp-paper text-cp-ink outline-none transition-colors hover:border-cp-paprika hover:bg-cp-paprika hover:text-cp-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cp-paprika"
            >
              <X className="size-5" strokeWidth={2} aria-hidden />
            </Dialog.Close>
          </header>

          <nav aria-label="Sections du site" className="flex-1">
            <ul className="space-y-1">
              {actionLinks.map((l) => (
                <li key={l.href}>
                  <Dialog.Close
                    render={<Link href={l.href} />}
                    className="block rounded-md px-3 py-3 font-display text-2xl italic text-cp-ink transition-colors hover:bg-cp-paper-deep hover:text-cp-paprika"
                  >
                    {l.label}
                  </Dialog.Close>
                </li>
              ))}
            </ul>

            {/* En pleine largeur le « | » n'a pas de sens : on marque la
                séparation par un filet horizontal. */}
            <div aria-hidden className="my-4 border-t border-cp-ink/25" />

            <ul className="space-y-1">
              {presentationLinks.map((l) => (
                <li key={l.href}>
                  <Dialog.Close
                    render={<Link href={l.href} />}
                    className="block rounded-md px-3 py-3 font-display text-2xl italic text-cp-ink transition-colors hover:bg-cp-paper-deep hover:text-cp-paprika"
                  >
                    {l.label}
                  </Dialog.Close>
                </li>
              ))}
            </ul>
          </nav>

          <footer className="space-y-3 border-t border-cp-ink/30 pt-6">
            <Dialog.Close
              render={<Link href="/login" />}
              className={buttonVariants({
                variant: "secondary",
                size: "default",
                className: "w-full",
              })}
            >
              Se connecter
            </Dialog.Close>
            <Dialog.Close
              render={<Link href="/signup" />}
              className={buttonVariants({
                size: "default",
                className: "w-full",
              })}
            >
              Réserver un séjour →
            </Dialog.Close>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
