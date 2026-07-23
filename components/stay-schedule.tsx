import { formatTime, formatWindow } from "@/lib/settings";
import { cn } from "@/lib/utils";

/// Horaires d'arrivée et de départ d'un séjour.
///
/// Partagé par la fiche de l'administration et celle du client : les deux
/// doivent annoncer la même heure, sans quoi le propriétaire se présente quand
/// personne ne l'attend.
///
/// Deux cas se lisent différemment. Sans exception, on annonce la PLAGE
/// d'accueil de la pension, « de 9h00 à 12h00 », parce que rien de plus précis
/// n'a été convenu. Avec exception, on annonce l'HEURE convenue, « à 9h00 »,
/// qui est un engagement pris avec ce client-là.

export type StaySchedule = {
  /// Heure convenue pour ce séjour, « HH:MM », ou null pour suivre la plage.
  arrivalTime: string | null;
  departureTime: string | null;
  /// Plages d'accueil de la pension, issues des réglages.
  arrivalWindow: { start: string; end: string };
  departureWindow: { start: string; end: string };
};

export function StaySchedule({
  schedule,
  className,
}: {
  schedule: StaySchedule;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-4 rounded-md border border-cp-ink/25 p-5 sm:grid-cols-2",
        className,
      )}
    >
      <Slot
        label="Arrivée"
        time={schedule.arrivalTime}
        window={schedule.arrivalWindow}
      />
      <Slot
        label="Départ"
        time={schedule.departureTime}
        window={schedule.departureWindow}
      />
    </dl>
  );
}

function Slot({
  label,
  time,
  window,
}: {
  label: string;
  time: string | null;
  window: { start: string; end: string };
}) {
  // Un test sur la valeur, et non `time !== null` : une chaîne vide ou une
  // valeur absente veulent dire la même chose ici, « rien de convenu ». Le test
  // strict laissait passer undefined et faisait tomber la fiche entière sur un
  // séjour dont le champ n'avait pas été chargé.
  //
  // Écrit sous cette forme pour que TypeScript en déduise le type : `Boolean(x)`
  // ne restreint pas la variable, `agreed ? time : …` aurait donc gardé le null.
  const agreed = time ? time : null;
  return (
    <div className="space-y-1">
      <dt className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
        {label}
      </dt>
      <dd className="font-display text-xl italic leading-snug text-cp-ink">
        {agreed ? `à ${formatTime(agreed)}` : formatWindow(window.start, window.end)}
      </dd>
      {/* Dire d'où vient l'heure, sinon on ne sait pas si elle a été convenue
          avec ce client ou si c'est l'horaire habituel de la maison. */}
      <dd className="font-body text-xs text-cp-ink-soft">
        {agreed ? "Horaire convenu pour ce séjour" : "Créneau d'accueil habituel"}
      </dd>
    </div>
  );
}
