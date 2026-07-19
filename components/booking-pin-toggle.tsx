"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pin, PinOff } from "lucide-react";

import { cn } from "@/lib/utils";

/// Épingle un séjour dans la file « À traiter ».
///
/// Rendu à CÔTÉ du lien de la ligne, jamais dedans : un bouton à l'intérieur
/// d'une ancre est du HTML invalide et casse le clic autant que le clavier.
export function BookingPinToggle({
  bookingId,
  pinned,
}: {
  bookingId: string;
  pinned: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle() {
    setError(false);
    startTransition(async () => {
      let ok = false;
      try {
        const res = await fetch(`/api/admin/bookings/${bookingId}/pin`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinned: !pinned }),
        });
        ok = res.ok;
      } catch {
        ok = false;
      }
      if (!ok) {
        setError(true);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={pinned}
      aria-label={
        pinned
          ? "Désépingler ce séjour de la file à traiter"
          : "Épingler ce séjour dans la file à traiter"
      }
      title={
        error
          ? "Échec, réessayez"
          : pinned
            ? "Désépingler"
            : "Épingler pour y revenir plus tard"
      }
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-md border transition-colors disabled:opacity-40",
        error
          ? "border-cp-paprika text-cp-paprika"
          : pinned
            ? "border-cp-paprika bg-cp-paprika text-cp-paper"
            : "border-cp-ink/25 text-cp-ink-soft hover:border-cp-paprika hover:text-cp-paprika",
      )}
    >
      {pinned ? (
        <PinOff className="size-4" strokeWidth={1.8} aria-hidden />
      ) : (
        <Pin className="size-4" strokeWidth={1.8} aria-hidden />
      )}
    </button>
  );
}
