"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatWindow } from "@/lib/settings";

/// Pose ou retire l'horaire convenu d'un séjour.
///
/// Un champ vide veut dire « suit le créneau habituel », et c'est le cas de la
/// quasi-totalité des séjours. L'exception se saisit quand elle a été convenue
/// au téléphone, « il passe déposer le chat à 9h ».

export function BookingScheduleControl({
  bookingId,
  arrivalTime,
  departureTime,
  arrivalWindow,
  departureWindow,
}: {
  bookingId: string;
  arrivalTime: string | null;
  departureTime: string | null;
  arrivalWindow: { start: string; end: string };
  departureWindow: { start: string; end: string };
}) {
  const router = useRouter();
  const [arrival, setArrival] = useState(arrivalTime ?? "");
  const [departure, setDeparture] = useState(departureTime ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty =
    arrival !== (arrivalTime ?? "") || departure !== (departureTime ?? "");

  function save() {
    setError(null);
    startTransition(async () => {
      let res: Response;
      try {
        res = await fetch(`/api/admin/bookings/${bookingId}/schedule`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Chaîne vide envoyée telle quelle : c'est ainsi qu'on dit
            // « retire l'exception », ce que `undefined` ne saurait exprimer.
            arrivalTime: arrival.trim(),
            departureTime: departure.trim(),
          }),
        });
      } catch {
        setError("Échec de l'enregistrement, réessayez.");
        return;
      }
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de l'enregistrement.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-md border border-cp-ink/25 p-5">
      <div className="space-y-1">
        <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-cp-paprika">
          Horaires convenus
        </p>
        <p className="font-body text-sm text-cp-ink-soft">
          Laissez vide pour suivre les créneaux habituels, arrivées{" "}
          {formatWindow(arrivalWindow.start, arrivalWindow.end)} et départs{" "}
          {formatWindow(departureWindow.start, departureWindow.end)}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="block font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
            Arrivée
          </span>
          <Input
            type="time"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            disabled={pending}
          />
        </label>
        <label className="space-y-1.5">
          <span className="block font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
            Départ
          </span>
          <Input
            type="time"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            disabled={pending}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" disabled={pending || !dirty} onClick={save}>
          {pending ? "Enregistrement…" : "Enregistrer les horaires"}
        </Button>
        {error && <p className="font-body text-sm text-cp-paprika">{error}</p>}
      </div>
    </div>
  );
}
