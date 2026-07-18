import type { Metadata } from "next";
import Link from "next/link";

import { CatIllustration } from "@/components/cat-illustration";
import { LibraryStamp } from "@/components/library-stamp";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "À propos · Le Chat-Pitre",
  description:
    "L'histoire de la maison, les humains qui la tiennent, et la méthode qui fait la différence.",
};

/// Page éditoriale « À propos ». Trois sections : la maison, les humains,
/// la méthode. Le texte de la section « Les humains » est un PLACEHOLDER
/// FICTIF (duo inventé), à remplacer par la vraie histoire ; le squelette
/// tient la mise en page.

export default function AboutPage() {
  return (
    <>
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="border-b border-cp-ink">
        <div className="mx-auto w-full max-w-6xl px-6 pt-16 pb-20 sm:px-10 sm:pt-24 sm:pb-28">
          <LibraryStamp tone="cobalt">À propos · les humains de la maison</LibraryStamp>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
            <div>
              <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl lg:text-7xl">
                Une maison ouverte
                <br />
                <span className="italic font-normal">par amour des chats,</span>
                <br />
                tenue comme un cabinet.
              </h1>
              <p className="mt-8 max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft sm:text-2xl">
                Le Chat-Pitre, c&apos;est sept chambres, un jardin, une
                cuisine, deux humains. Et autant d&apos;heures que nécessaire
                pour que chaque pensionnaire reparte plus serein qu&apos;il
                n&apos;est arrivé.
              </p>
            </div>

            <div className="mx-auto w-full max-w-md lg:mx-0">
              <div className="overflow-hidden rounded-md border-2 border-cp-ink shadow-[8px_8px_0_0_var(--color-cp-cobalt)]">
                <CatIllustration
                  variant="cobalt"
                  pose="standing"
                  ariaLabel="Chat marchant dans la maison"
                  className="aspect-square w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          01 — LA MAISON
          ============================================================ */}
      <section className="border-b border-cp-ink">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <SectionHeading
            number="01"
            title="La maison"
            kicker="Comment c'est arrivé."
            tone="cobalt"
          />

          <div className="mt-12 grid gap-12 lg:grid-cols-[2fr_3fr]">
            <div className="space-y-5 font-body text-base leading-relaxed text-cp-ink">
              <p>
                La maison du N° 47 a accueilli son premier chat en juin 2024.
                Il s&apos;appelait Hugolin. Son humaine partait en
                déplacement d&apos;une semaine et ne voulait pas le confier
                à une chaîne, elle cherchait quelqu&apos;un qui le
                connaisse vraiment.
              </p>
              <p>
                Une chambre est devenue deux, deux sont devenues sept.
                L&apos;échoppe a été reconfigurée à l&apos;automne 2023 pour
                accueillir des séjours plus longs et plus calmes. Les
                premiers chats avaient leur nom écrit sur la porte au
                feutre ; les nouveaux ont des plaques en bois gravées.
              </p>
              <p>
                Les chambres, le jardin et la cuisine sont détaillés sur{" "}
                <Link
                  href="/le-lieu"
                  className="font-semibold text-cp-paprika underline underline-offset-4 decoration-[1.5px] decoration-cp-paprika/40 transition-colors hover:decoration-cp-paprika"
                >
                  la page Le lieu
                </Link>
                .
              </p>
            </div>

            <RuledBox variant="deep" as="blockquote">
              <p className="font-display text-2xl italic leading-snug text-cp-ink sm:text-3xl">
                « On a commencé pour faire plaisir à un chat qui le
                méritait. On continue parce qu&apos;il en arrive d&apos;autres,
                et qu&apos;on s&apos;est rendus compte qu&apos;on faisait
                ça bien. »
              </p>
              <p className="mt-6 font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] text-cp-paprika">
                récit de fondation, juin 2024
              </p>
            </RuledBox>
          </div>
        </div>
      </section>

      {/* ============================================================
          02 — L'HUMAIN
          ============================================================ */}
      <section className="border-b border-cp-ink bg-cp-paper-deep">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <SectionHeading
            number="02"
            title="Les humains"
            kicker="Qui s'occupe vraiment de votre chat."
            tone="paprika"
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
            <div className="mx-auto w-full max-w-sm lg:mx-0">
              <div className="overflow-hidden rounded-md border-2 border-cp-ink shadow-[8px_8px_0_0_var(--color-cp-paprika)]">
                <CatIllustration
                  variant="paprika"
                  pose="sitting"
                  ariaLabel="Les humains sont tellement chats qu'on en a fait un chat"
                  className="aspect-square w-full"
                />
              </div>
              <p className="mt-4 text-center font-display text-sm italic text-cp-ink-soft">
                Photo réelle à venir.
              </p>
            </div>

            <div className="space-y-5 font-body text-base leading-relaxed text-cp-ink">
              <p>
                <strong className="font-semibold">
                  Nous sommes deux à tenir la maison.
                </strong>{" "}
                Deux parcours qui se complètent : la librairie jeunesse
                d&apos;un côté, le soin animalier de l&apos;autre. Sept ans
                de bénévolat à l&apos;École du Chat à nous deux, et deux
                formations en comportement félin (Lille 2022, Bordeaux 2023).
              </p>
              <p>
                Être deux, c&apos;est ce qui nous permet de ne jamais laisser
                la maison vide et de tenir le rythme de chaque pensionnaire :
                même heure de repas, même façon d&apos;ouvrir la porte, même
                endroit pour le panier. Les chats reconnaissent une voix, une
                odeur, une habitude, alors nous nous accordons sur tout ce qui
                les concerne.
              </p>
              <p>
                Chaque arrivée se prépare à deux : nous relisons ensemble la
                fiche de votre chat avant le premier jour, et la personne qui
                l&apos;accueille reste sa référence pendant tout le séjour.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          03 — LA MÉTHODE
          ============================================================ */}
      <section className="border-b border-cp-ink">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <SectionHeading
            number="03"
            title="La méthode"
            kicker="Trois principes."
            tone="feuille"
          />

          <ol className="mt-14 grid gap-6 sm:grid-cols-3">
            <Principle
              number="01"
              title="Une chambre par caractère"
              gloss="Chaque chat a sa chambre. Les espaces communs (jardin, cuisine) sont attribués par tranches horaires, jamais de cohabitation forcée."
              tone="cobalt"
            />
            <Principle
              number="02"
              title="Vos habitudes, gardées"
              gloss="Heure des repas, cachette préférée, petites manies : nous reprenons le rituel de votre chat à l'identique. Il garde ses repères, il ne s'adapte pas aux nôtres."
              tone="paprika"
            />
            <Principle
              number="03"
              title="Un journal quotidien"
              gloss="Pendant le séjour, vous recevez une note photo par jour : vous savez où votre chat dort, mange, joue, sans avoir à demander."
              tone="canari"
            />
          </ol>
        </div>
      </section>

      {/* ============================================================
          CTA finale
          ============================================================ */}
      <section className="bg-cp-cobalt text-cp-paper">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cp-canari">
                la suite
              </p>
              <p className="mt-6 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight text-cp-paper sm:text-5xl">
                Vous voulez nous confier votre chat ?
              </p>
              <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-cp-paper/85 sm:text-lg">
                On commence par un échange par email pour faire connaissance,
                puis vous remplissez la fiche en ligne. Réponse sous 48h.
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
                  href="mailto:bonjour@chat-pitre.fr"
                  className="font-body text-sm font-semibold text-cp-paper/85 underline underline-offset-[5px] decoration-[1.5px] decoration-cp-paper/40 hover:decoration-cp-canari hover:text-cp-canari"
                >
                  bonjour@chat-pitre.fr
                </Link>
              </div>
            </div>

            <div className="mx-auto w-full max-w-md lg:mx-0">
              <div className="overflow-hidden rounded-md border-2 border-cp-canari shadow-[8px_8px_0_0_var(--color-cp-canari)]">
                <CatIllustration
                  variant="canari"
                  pose="watching"
                  ariaLabel="Chat observant"
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

function Principle({
  number,
  title,
  gloss,
  tone,
}: {
  number: string;
  title: string;
  gloss: string;
  tone: "cobalt" | "paprika" | "canari";
}) {
  const bg = {
    cobalt: "bg-cp-cobalt text-cp-paper",
    paprika: "bg-cp-paprika text-cp-paper",
    canari: "bg-cp-canari text-cp-ink",
  }[tone];

  return (
    <li className={`flex flex-col gap-3 rounded-md border border-cp-ink p-7 sm:p-8 ${bg}`}>
      <span
        className={`font-mono text-xs font-bold uppercase tracking-[0.18em] ${
          tone === "canari" ? "text-cp-ink/75" : "text-cp-paper/85"
        }`}
      >
        principe {number}
      </span>
      <h3 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
        {title}
      </h3>
      <p
        className={`font-body text-base leading-relaxed ${
          tone === "canari" ? "text-cp-ink/85" : "text-cp-paper/90"
        }`}
      >
        {gloss}
      </p>
    </li>
  );
}
