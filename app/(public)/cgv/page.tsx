import type { Metadata } from "next";

import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";

export const metadata: Metadata = {
  title: "Conditions générales — Le Chat-Pitre",
  description:
    "Conditions générales de vente et de séjour de la maison Le Chat-Pitre.",
};

/// Conditions générales de vente et de séjour. Squelette de placeholder
/// (à remplacer par les CGV définitives du client) au format article
/// numéroté, lisible comme un règlement de maison.

export default function CGVPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-10 sm:py-28">
      <header className="space-y-6">
        <LibraryStamp boxed>
          N° 004 — Conditions générales — Édition 2024
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl lg:text-7xl">
          Conditions
          <br />
          <span className="italic font-normal">générales</span>
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft sm:text-2xl">
          Les règles écrites de la maison — pour que la confiance entre nous
          n&apos;ait jamais à reposer sur la mémoire.
        </p>
      </header>

      <RuleDivider weight="heavy" className="my-16" />

      <div className="space-y-14">
        <Article number="01" title="Objet">
          <p>
            Les présentes conditions régissent les séjours des chats confiés à
            la maison « Le Chat-Pitre » par leurs propriétaires. Elles
            s&apos;appliquent à toute réservation effectuée via le site, par
            courrier ou par téléphone.
          </p>
        </Article>

        <Article number="02" title="Réservation et acompte">
          <p>
            Une réservation devient ferme à réception, par la maison, du
            virement d&apos;acompte fixé à <strong>trente pour cent</strong>{" "}
            du prix total estimé. Le solde est dû le jour du départ du chat.
          </p>
          <p>
            La maison peut refuser une réservation sans avoir à motiver son
            choix, notamment si les conditions d&apos;admission ne sont pas
            réunies ou si le calendrier est complet.
          </p>
        </Article>

        <Article number="03" title="Conditions d'admission">
          <p>
            Sont admis à séjourner les chats stérilisés, identifiés (puce ou
            tatouage à jour), vaccinés contre le typhus et le coryza, et
            sociables avec leurs congénères ou avec les humains de la maison.
          </p>
          <p>
            La maison se réserve le droit d&apos;écourter un séjour si un
            chat manifeste des comportements dangereux pour lui-même, pour
            les autres pensionnaires ou pour les humains. Les frais engagés
            restent dus prorata temporis.
          </p>
        </Article>

        <Article number="04" title="Annulation">
          <p>
            L&apos;annulation est gratuite jusqu&apos;à sept jours calendaires
            avant la date d&apos;arrivée prévue. Au-delà de ce délai,
            l&apos;acompte versé reste acquis à la maison.
          </p>
          <p>
            En cas de force majeure (hospitalisation du propriétaire, décès du
            chat, sinistre majeur), l&apos;acompte est intégralement remboursé
            sur présentation d&apos;un justificatif.
          </p>
        </Article>

        <Article number="05" title="Santé et urgences">
          <p>
            La maison veille quotidiennement à l&apos;état des pensionnaires.
            En cas de signe clinique inquiétant, elle se réserve le droit de
            conduire le chat chez le vétérinaire partenaire (situé à six
            cents mètres) sans accord préalable du propriétaire, qui est
            informé dans la foulée. Les frais vétérinaires restent à la
            charge du propriétaire.
          </p>
        </Article>

        <Article number="06" title="Effets personnels">
          <p>
            Les couvertures, jouets et autres effets personnels apportés par
            le propriétaire sont restitués au départ. La maison décline toute
            responsabilité en cas de perte ou détérioration d&apos;un objet
            non identifié au nom du chat.
          </p>
        </Article>

        <Article number="07" title="Responsabilité">
          <p>
            La maison souscrit une assurance responsabilité civile
            professionnelle couvrant les dommages causés aux pensionnaires
            durant leur séjour. Cette assurance n&apos;intervient pas en cas
            de maladie préexistante non déclarée ou de mensonge sur la fiche
            féline.
          </p>
        </Article>

        <Article number="08" title="Tarifs">
          <p>
            Les tarifs en vigueur sont ceux affichés au moment de la
            réservation, et tels qu&apos;ils apparaissent sur le récapitulatif
            de réservation envoyé par retour de fiche.
          </p>
        </Article>

        <Article number="09" title="Droit applicable">
          <p>
            Les présentes conditions sont régies par le droit français. Tout
            litige relèvera de la compétence des tribunaux du ressort du
            siège de la maison.
          </p>
        </Article>
      </div>

      <RuleDivider weight="heavy" className="mt-16" />

      <p className="mt-10 font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft">
        § fin du document — édition à valider par le propriétaire
      </p>
    </article>
  );
}

function Article({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <header className="flex items-baseline gap-4">
        <span className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cp-sanguine">
          § {number}
        </span>
        <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-cp-ink sm:text-3xl">
          {title}
        </h2>
      </header>
      <div className="space-y-3 border-l border-cp-ink/30 pl-6 font-body text-base leading-relaxed text-cp-ink">
        {children}
      </div>
    </section>
  );
}
