import type { Metadata } from "next";
import Link from "next/link";

import { AdmissionCriteria } from "@/components/admission-criteria";
import { FaqAccordion, type FaqItem } from "@/components/faq-accordion";
import { LibraryStamp } from "@/components/library-stamp";
import { PriceCard } from "@/components/price-card";
import { RuleDivider } from "@/components/rule-divider";
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
          HERO — wordmark gigantesque + sous-titre italique + CTA.
          ============================================================ */}
      <section className="relative">
        <div className="mx-auto w-full max-w-6xl px-6 pt-20 pb-24 sm:px-10 sm:pt-28 sm:pb-32 lg:pt-32 lg:pb-40">
          {/* Méta haute */}
          <div className="cp-reveal mb-12 flex flex-wrap items-center justify-between gap-3 sm:mb-16">
            <LibraryStamp>
              N° 047 — rue de la Chartreuse — Bordeaux
            </LibraryStamp>
            <LibraryStamp>Établissement permanent · Est. 2024</LibraryStamp>
          </div>

          {/* Wordmark — typographie démesurée, fade au load */}
          <Wordmark
            as="h1"
            className="cp-fade text-[clamp(4rem,16vw,12rem)]"
          />

          {/* Sous-titre italique grand */}
          <p
            className="cp-reveal mt-10 max-w-3xl font-display text-3xl italic leading-[1.05] tracking-tight text-cp-ink sm:text-4xl lg:text-5xl"
            style={{ "--cp-delay": "120ms" } as React.CSSProperties}
          >
            Maison de villégiature pour les félins de bonne compagnie.
          </p>

          {/* Sous-titre corps */}
          <p
            className="cp-reveal mt-8 max-w-xl font-body text-base leading-relaxed text-cp-ink-soft sm:text-lg"
            style={{ "--cp-delay": "220ms" } as React.CSSProperties}
          >
            Sept chambres pour les chats de Bordeaux et d&apos;ailleurs. Sept
            caractères, sept manies, sept façons d&apos;être ailleurs en
            restant chez soi.
          </p>

          {/* CTAs */}
          <div
            className="cp-reveal mt-12 flex flex-wrap items-center gap-5"
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
      </section>

      {/* Bande horizontale d'encre — séparation forte avant le contenu */}
      <RuleDivider weight="heavy" className="mx-auto w-full max-w-6xl px-6 sm:px-10" />

      {/* ============================================================
          01 — CONDITIONS D'ADMISSION
          ============================================================ */}
      <section
        id="admission"
        aria-labelledby="admission-title"
        className="scroll-mt-24"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
          <SectionHeading
            number="01"
            title="Conditions d'admission"
            kicker="Quatre exigences. Pas une de plus."
          />
          <div className="mt-16">
            <AdmissionCriteria />
          </div>
          <p className="mt-10 max-w-2xl font-body text-base leading-relaxed text-cp-ink-soft">
            Une exigence manquante n&apos;est pas un refus automatique :
            écrivez-nous, nous regardons au cas par cas. Les chats qui ne
            répondent à aucun de ces critères sont en revanche redirigés vers
            d&apos;autres maisons.
          </p>
        </div>
      </section>

      <RuleDivider weight="heavy" className="mx-auto w-full max-w-6xl px-6 sm:px-10" />

      {/* ============================================================
          02 — TARIF DES SÉJOURS
          ============================================================ */}
      <section
        id="tarif"
        aria-labelledby="tarif-title"
        className="scroll-mt-24 bg-cp-paper-deep cp-grain"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
          <SectionHeading
            number="02"
            title="Tarif des séjours"
            kicker="Une formule par chat, une formule par foyer."
          />
          <div className="mt-16 grid gap-6 lg:grid-cols-2">
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
              <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-sanguine">
                § acompte
              </span>{" "}
              — 30 % à la réservation par virement, solde au départ.
              Annulation gratuite jusqu&apos;à sept jours avant l&apos;arrivée ;
              au-delà, l&apos;acompte reste acquis à la maison.
            </p>
          </RuledBox>
        </div>
      </section>

      <RuleDivider weight="heavy" className="mx-auto w-full max-w-6xl px-6 sm:px-10" />

      {/* ============================================================
          03 — DÉROULEMENT
          ============================================================ */}
      <section
        id="deroulement"
        aria-labelledby="deroulement-title"
        className="scroll-mt-24"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
          <SectionHeading
            number="03"
            title="Déroulement"
            kicker="Quatre étapes — un mois en avance, de préférence."
          />
          <ol className="mt-16 border-t border-cp-ink">
            {STEPS.map((s, i) => (
              <li
                key={s.number}
                className="cp-reveal grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 border-b border-cp-ink py-10 sm:grid-cols-[5rem_1fr_2fr] sm:gap-x-10 sm:py-14"
                style={{ "--cp-delay": `${i * 80}ms` } as React.CSSProperties}
              >
                <span className="font-display text-6xl font-bold leading-none tracking-tight text-cp-ink sm:text-7xl">
                  {s.number}
                </span>
                <h3 className="col-span-1 font-display text-2xl font-medium leading-tight text-cp-ink sm:text-3xl">
                  {s.title}
                </h3>
                <p className="col-span-2 max-w-xl font-body text-base leading-relaxed text-cp-ink-soft sm:col-span-1">
                  {s.gloss}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <RuleDivider weight="heavy" className="mx-auto w-full max-w-6xl px-6 sm:px-10" />

      {/* ============================================================
          04 — QUESTIONS D'HONNEUR
          ============================================================ */}
      <section
        id="questions"
        aria-labelledby="questions-title"
        className="scroll-mt-24"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
          <SectionHeading
            number="04"
            title="Questions d'honneur"
            kicker="Les réponses aux interrogations légitimes."
          />
          <div className="mt-16">
            <FaqAccordion items={FAQ} />
          </div>
        </div>
      </section>

      <RuleDivider weight="heavy" className="mx-auto w-full max-w-6xl px-6 sm:px-10" />

      {/* ============================================================
          CTA finale
          ============================================================ */}
      <section className="bg-cp-ink text-cp-paper">
        <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paper/70">
            § rendez-vous
          </p>
          <p className="mt-6 max-w-4xl font-display text-4xl font-medium leading-[1.05] tracking-tight text-cp-paper sm:text-5xl lg:text-6xl">
            Confiez-nous votre chat pour quelques nuits — il ne sera pas seul,
            et vous saurez où il dort.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-5">
            <Link
              href="/signup"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className:
                  "px-10 bg-cp-paper text-cp-ink border-cp-paper hover:bg-cp-sanguine hover:text-cp-paper hover:border-cp-sanguine",
              })}
            >
              Réserver un séjour →
            </Link>
            <Link
              href="/login"
              className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cp-paper/70 underline-offset-[6px] decoration-[1.5px] hover:underline hover:text-cp-paper"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
