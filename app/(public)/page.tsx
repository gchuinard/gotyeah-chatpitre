import type { Metadata } from "next";
import Link from "next/link";

import { AdmissionCriteria } from "@/components/admission-criteria";
import { CatIllustration } from "@/components/cat-illustration";
import { FaqAccordion, type FaqItem } from "@/components/faq-accordion";
import { LibraryStamp } from "@/components/library-stamp";
import { PriceCard } from "@/components/price-card";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

export const metadata: Metadata = {
  title: "Le Chat-Pitre — Maison de villégiature pour félins",
  description:
    "Pension féline à Bordeaux. Sept chambres, un jardin, une cuisine, un humain. Réservation en ligne.",
};

const STEPS: { number: string; title: string; gloss: string }[] = [
  {
    number: "01",
    title: "Vous écrivez",
    gloss:
      "Deux dates, autant de chats que vous voulez nous confier. Un mot suffit.",
  },
  {
    number: "02",
    title: "Vous renseignez la fiche",
    gloss:
      "Identité, vaccins, manies, sociabilité — les exigences de la maison sont là.",
  },
  {
    number: "03",
    title: "Nous validons",
    gloss:
      "En quarante-huit heures, par retour de fiche, avec les détails pratiques.",
  },
  {
    number: "04",
    title: "Votre chat s'installe",
    gloss:
      "Du jour J au jour J+N. Nouvelles régulières, photos sur demande, rien à faire d'autre.",
  },
];

const FAQ: FaqItem[] = [
  {
    question: "Combien de chats accueillez-vous en même temps ?",
    answer:
      "Sept chambres, donc sept chats — quatorze si plusieurs membres d'un même foyer partagent la chambre. Les espaces communs (jardin clos, cuisine) sont tournants pour éviter les rencontres non souhaitées.",
  },
  {
    question: "Mon chat n'est pas vacciné contre la leucose. Est-ce un refus ?",
    answer:
      "Non. Typhus et coryza sont indispensables ; la leucose est seulement recommandée. Nous adapterons l'accueil pour éviter tout contact direct avec les autres pensionnaires.",
  },
  {
    question: "Puis-je rendre visite à mon chat pendant son séjour ?",
    answer:
      "Cela n'est pas une bonne idée : la plupart des chats régressent lorsqu'on leur rappelle ce qui leur manque. Photos quotidiennes et un appel à mi-séjour, c'est mieux pour tout le monde.",
  },
  {
    question: "Que se passe-t-il en cas de problème de santé ?",
    answer:
      "Nous travaillons avec un cabinet vétérinaire situé à 600 mètres. En urgence nous y allons sans attendre votre accord ; nous vous prévenons dans la foulée.",
  },
  {
    question: "Y a-t-il un acompte ? Quand paie-t-on ?",
    answer:
      "30 % à la réservation par virement. Solde au départ. Annulation gratuite jusqu'à sept jours avant l'arrivée ; au-delà, l'acompte reste acquis.",
  },
  {
    question: "Acceptez-vous les chatons et les très vieux chats ?",
    answer:
      "Chatons à partir de huit semaines, vieux chats sans limite. Pour les seniors, prévoir une fiche médicale détaillée et un dialogue préalable.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ============================================================
          HERO — wordmark + tagline + CTAs + grand chat illustré.
          ============================================================ */}
      <section className="relative">
        <div className="mx-auto w-full max-w-6xl px-6 pt-16 pb-20 sm:px-10 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-32">
          <div className="cp-reveal mb-10 flex flex-wrap items-center justify-between gap-3">
            <LibraryStamp tone="cobalt">
              N° 047 — rue de la Chartreuse — Bordeaux
            </LibraryStamp>
            <LibraryStamp tone="paprika">Établissement permanent · Est. 2024</LibraryStamp>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
            <div>
              <Wordmark
                as="h1"
                className="cp-fade text-[clamp(3.5rem,12vw,9rem)]"
              />

              <p
                className="cp-reveal mt-8 max-w-2xl font-display text-3xl italic leading-[1.05] tracking-tight text-cp-ink sm:text-4xl lg:text-5xl"
                style={{ "--cp-delay": "120ms" } as React.CSSProperties}
              >
                Maison de villégiature pour les félins de bonne compagnie.
              </p>

              <p
                className="cp-reveal mt-8 max-w-xl font-body text-base leading-relaxed text-cp-ink-soft sm:text-lg"
                style={{ "--cp-delay": "220ms" } as React.CSSProperties}
              >
                Sept chambres pour les chats de Bordeaux et d&apos;ailleurs.
                Sept caractères, sept manies, sept façons d&apos;être ailleurs
                en restant chez soi.
              </p>

              <div
                className="cp-reveal mt-10 flex flex-wrap items-center gap-4"
                style={{ "--cp-delay": "320ms" } as React.CSSProperties}
              >
                <Link
                  href="/signup"
                  className={buttonVariants({
                    size: "lg",
                    className: "px-10",
                  })}
                >
                  Réserver un séjour →
                </Link>
                <Link
                  href="/le-lieu"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "lg",
                  })}
                >
                  Visiter la maison
                </Link>
              </div>
            </div>

            {/* Illustration hero — grand chat canari (couleur soleil) */}
            <div
              className="cp-reveal mx-auto w-full max-w-md lg:mx-0"
              style={{ "--cp-delay": "200ms" } as React.CSSProperties}
            >
              <div className="overflow-hidden rounded-md border-2 border-cp-ink shadow-[8px_8px_0_0_var(--color-cp-ink)]">
                <CatIllustration
                  variant="canari"
                  pose="sitting"
                  ariaLabel="Chat assis, pensionnaire de la maison"
                  className="aspect-square w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          01 — CONDITIONS D'ADMISSION
          ============================================================ */}
      <section
        id="admission"
        aria-labelledby="admission-title"
        className="scroll-mt-24 border-t border-cp-ink"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <SectionHeading
            number="01"
            title="Conditions d'admission"
            kicker="Quatre exigences. Pas une de plus."
            tone="cobalt"
          />
          <div className="mt-12">
            <AdmissionCriteria />
          </div>
          <p className="mt-10 max-w-2xl font-body text-base leading-relaxed text-cp-ink">
            Une exigence manquante n&apos;est pas un refus automatique :
            écrivez-nous, nous regardons au cas par cas. Les chats qui ne
            répondent à aucun de ces critères sont en revanche redirigés vers
            d&apos;autres maisons.
          </p>
        </div>
      </section>

      {/* ============================================================
          02 — TARIF DES SÉJOURS
          ============================================================ */}
      <section
        id="tarif"
        aria-labelledby="tarif-title"
        className="scroll-mt-24 border-t border-cp-ink bg-cp-paper-deep"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <SectionHeading
            number="02"
            title="Tarif des séjours"
            kicker="Une formule par chat, une formule par foyer."
            tone="paprika"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <PriceCard
              reference="A"
              title="Un chat"
              amount="22€"
              unit="nuit"
              notes={[
                "Repas, litière, ménage quotidien inclus.",
                "Compléments médicaux apportés par le propriétaire.",
                "Réduction de 10 % au-delà de quatorze nuits.",
              ]}
            />
            <PriceCard
              reference="B"
              title="Deux chats du même foyer"
              amount="40€"
              unit="nuit"
              variant="feature"
              notes={[
                "Chambre partagée — pour les frères et sœurs habitués.",
                "Repas et litière dédiés par pensionnaire.",
                "Au-delà de deux chats : nous écrire pour un devis.",
              ]}
            />
          </div>
          <RuledBox className="mt-10 max-w-3xl">
            <p className="font-body text-base leading-relaxed text-cp-ink">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cp-paprika">
                Acompte —{" "}
              </span>
              30 % à la réservation par virement, solde au départ. Annulation
              gratuite jusqu&apos;à sept jours avant l&apos;arrivée ; au-delà,
              l&apos;acompte reste acquis à la maison.
            </p>
          </RuledBox>
        </div>
      </section>

      {/* ============================================================
          03 — DÉROULEMENT
          ============================================================ */}
      <section
        id="deroulement"
        aria-labelledby="deroulement-title"
        className="scroll-mt-24 border-t border-cp-ink"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <SectionHeading
            number="03"
            title="Déroulement"
            kicker="Quatre étapes — un mois en avance, de préférence."
            tone="feuille"
          />

          <div className="mt-14 grid gap-10 lg:grid-cols-[7fr_5fr] lg:items-center">
            <ol className="border-t border-cp-ink">
              {STEPS.map((s, i) => (
                <li
                  key={s.number}
                  className="cp-reveal grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 border-b border-cp-ink py-8 sm:gap-x-10"
                  style={{ "--cp-delay": `${i * 80}ms` } as React.CSSProperties}
                >
                  <span className="font-display text-5xl font-semibold leading-none tracking-tight text-cp-feuille sm:text-6xl">
                    {s.number}
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl font-semibold leading-tight text-cp-ink sm:text-3xl">
                      {s.title}
                    </h3>
                    <p className="font-body text-base leading-relaxed text-cp-ink-soft">
                      {s.gloss}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div
              className="cp-reveal hidden lg:block"
              style={{ "--cp-delay": "320ms" } as React.CSSProperties}
            >
              <div className="overflow-hidden rounded-md border-2 border-cp-ink shadow-[8px_8px_0_0_var(--color-cp-ink)]">
                <CatIllustration
                  variant="feuille"
                  pose="watching"
                  ariaLabel="Chat observant"
                  className="aspect-square w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          04 — QUESTIONS D'HONNEUR
          ============================================================ */}
      <section
        id="questions"
        aria-labelledby="questions-title"
        className="scroll-mt-24 border-t border-cp-ink bg-cp-paper-deep"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <SectionHeading
            number="04"
            title="Questions d'honneur"
            kicker="Les réponses aux interrogations légitimes."
            tone="canari"
          />
          <div className="mt-12">
            <FaqAccordion items={FAQ} />
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA finale
          ============================================================ */}
      <section className="border-t border-cp-ink bg-cp-cobalt text-cp-paper">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cp-canari">
                rendez-vous
              </p>
              <p className="mt-6 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight text-cp-paper sm:text-5xl lg:text-6xl">
                Confiez-nous votre chat pour quelques nuits — il ne sera pas
                seul, et vous saurez où il dort.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Link
                  href="/signup"
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "px-10 border-cp-canari bg-cp-canari text-cp-ink hover:bg-cp-canari-deep hover:border-cp-canari-deep",
                  })}
                >
                  Réserver un séjour →
                </Link>
                <Link
                  href="/login"
                  className="font-body text-sm font-semibold text-cp-paper/80 underline underline-offset-[5px] decoration-[1.5px] decoration-cp-paper/40 hover:decoration-cp-canari hover:text-cp-canari"
                >
                  J&apos;ai déjà un compte
                </Link>
              </div>
            </div>

            <div className="mx-auto w-full max-w-md lg:mx-0">
              <div className="overflow-hidden rounded-md border-2 border-cp-canari shadow-[8px_8px_0_0_var(--color-cp-canari)]">
                <CatIllustration
                  variant="paprika"
                  pose="sleeping"
                  ariaLabel="Chat endormi"
                  className="aspect-square w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
