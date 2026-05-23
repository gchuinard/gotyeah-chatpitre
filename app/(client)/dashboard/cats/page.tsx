import Link from "next/link";

import { CatCard } from "@/components/cat-card";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { buttonVariants } from "@/components/ui/button";
import { CURRENT_OWNER_ID, getCatsByOwner } from "@/lib/fixtures";

/// Liste de la troupe : grille de fiches CatCard, chaque carte clique
/// vers l'édition. Maquette statique (fixtures).

export default function CatsListPage() {
  const cats = getCatsByOwner(CURRENT_OWNER_ID);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      {/* Fil d'Ariane */}
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/dashboard" className="hover:text-cp-paprika">
          Mon espace
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Pensionnaires</span>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-8">
        <div className="space-y-4">
          <LibraryStamp boxed>
            La troupe — {cats.length} pensionnaire{cats.length > 1 ? "s" : ""}
          </LibraryStamp>
          <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
            Mes pensionnaires
          </h1>
          <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
            Chaque chat a sa fiche, avec ses critères d&apos;admission et ses
            manies. Une fiche tenue à jour, c&apos;est un séjour plus rapide à
            accepter.
          </p>
        </div>

        <Link
          href="/dashboard/cats/new"
          className={buttonVariants({ size: "lg", className: "px-8" })}
        >
          + Déclarer un pensionnaire
        </Link>
      </header>

      <RuleDivider className="my-14" />

      {cats.length === 0 ? (
        <EmptyTroop />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/dashboard/cats/${cat.id}/edit`}
                className="group block outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cp-paprika"
              >
                <CatCard
                  reference={cat.reference}
                  name={cat.name}
                  sex={cat.sex}
                  breed={cat.breed}
                  ageLabel={cat.ageLabel}
                  criteria={cat.criteria}
                  className="transition-shadow group-hover:shadow-[6px_6px_0_0_var(--color-cp-ink)]"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyTroop() {
  return (
    <div className="flex flex-col items-start gap-6 border border-cp-ink/40 bg-cp-paper-deep/60 p-10 sm:p-14">
      <LibraryStamp>aucune fiche déclarée</LibraryStamp>
      <p className="font-display text-3xl italic leading-tight text-cp-ink">
        La troupe est encore vide.
      </p>
      <p className="max-w-md font-body text-base leading-relaxed text-cp-ink-soft">
        Avant de demander un premier séjour, déclarez la fiche d&apos;au
        moins un chat — identité, critères d&apos;admission, manies.
      </p>
      <Link
        href="/dashboard/cats/new"
        className={buttonVariants({ size: "default" })}
      >
        Déclarer un pensionnaire →
      </Link>
    </div>
  );
}
