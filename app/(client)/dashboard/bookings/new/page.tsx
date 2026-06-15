import Link from "next/link";

import { LibraryStamp } from "@/components/library-stamp";
import { NewBookingForm } from "@/components/new-booking-form";
import { RuleDivider } from "@/components/rule-divider";
import { getCurrentUser } from "@/lib/auth";
import { getCatsByOwner, getExtraPresets } from "@/lib/repository";

/// Demande de nouveau séjour — Prisma : on charge les chats du propriétaire
/// et le catalogue de suppléments, puis on passe au formulaire client qui
/// POST sur l'API.

export default async function NewBookingPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [cats, presets] = await Promise.all([
    getCatsByOwner(user.id),
    getExtraPresets(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-20">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/dashboard" className="hover:text-cp-paprika">
          Mon espace
        </Link>
        <span aria-hidden>/</span>
        <Link href="/dashboard/bookings" className="hover:text-cp-paprika">
          Séjours
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Nouvelle demande</span>
      </nav>

      <header className="space-y-5">
        <LibraryStamp boxed>Nouvelle demande de séjour</LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Réserver un séjour
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          Indiquez vos dates, choisissez les pensionnaires concernés, ajoutez
          un mot si nécessaire. La maison répondra sous 48h.
        </p>
      </header>

      <RuleDivider className="my-12" />

      <NewBookingForm
        cats={cats}
        presets={presets.map((p) => ({
          id: p.id,
          label: p.label,
          defaultAmount: Number(p.defaultAmount),
        }))}
      />
    </div>
  );
}
