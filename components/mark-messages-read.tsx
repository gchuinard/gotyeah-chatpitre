"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/// Marque les messages du client comme lus quand la fiche séjour est réellement
/// affichée. Ne rend rien.
///
/// Pourquoi un effet et non le rendu serveur : Next précharge les liens, et un
/// marquage fait pendant le rendu aurait vidé la file « À traiter » au simple
/// survol d'une ligne du tableau de bord, sans que personne n'ait rien lu.
///
/// Le rafraîchissement n'a lieu QUE si des messages ont réellement changé
/// d'état, sinon chaque ouverture de fiche déclencherait un aller-retour inutile
/// et une boucle de rendu.
export function MarkMessagesRead({
  bookingId,
  hasUnread,
}: {
  bookingId: string;
  hasUnread: boolean;
}) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (!hasUnread || done.current) return;
    done.current = true;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/admin/bookings/${bookingId}/messages/read`, {
          method: "PATCH",
        });
        if (!res.ok || cancelled) return;
        const data: { marked?: number } = await res.json().catch(() => ({}));
        if (data.marked && data.marked > 0) router.refresh();
      } catch {
        // Sans réseau, le séjour reste dans la file : c'est le bon échec.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId, hasUnread, router]);

  return null;
}
