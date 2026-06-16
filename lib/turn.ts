// Génération de credentials TURN éphémères via Cloudflare Realtime.
//
// La vidéo des télé-rendez-vous passe en WebRTC pair-à-pair ; le serveur TURN
// ne sert que de relais quand la connexion P2P directe échoue (NAT restrictif,
// pare-feu). Les credentials sont à courte durée de vie et générés à la demande
// (jamais stockés en base). Les secrets Cloudflare sont lus au runtime, en lazy,
// pour ne pas casser le build (CI / Docker n'ont pas ces variables).
//
// API : POST https://rtc.live.cloudflare.com/v1/turn/keys/$KEY_ID/credentials/generate-ice-servers
// (cf. https://developers.cloudflare.com/realtime/turn/generate-credentials/)

/// Un serveur ICE (STUN ou TURN) au format attendu par RTCPeerConnection.
export type IceServer = {
  urls: string[] | string;
  username?: string;
  credential?: string;
};

// Durée de vie des credentials TURN (secondes). Large devant la durée d'un rdv ;
// de nouveaux credentials sont générés à chaque ouverture de la page d'appel.
const TURN_CREDENTIAL_TTL = 86_400; // 24 h

// STUN public de secours quand aucune clé Cloudflare n'est configurée. Suffit
// pour un appel 1:1 en LAN / localhost (sans relais), mais reste insuffisant
// derrière un NAT restrictif en production — d'où le vrai TURN Cloudflare.
const FALLBACK_ICE_SERVERS: IceServer[] = [
  { urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] },
];

/**
 * Renvoie la liste des serveurs ICE (STUN + TURN) à passer à RTCPeerConnection.
 *
 * Si les clés Cloudflare ne sont pas configurées (ou en cas d'erreur réseau),
 * renvoie un STUN public seul — mode dégradé : OK en local, insuffisant derrière
 * un NAT restrictif. `customIdentifier` tague l'usage par utilisateur (analytics
 * / détection d'abus côté Cloudflare).
 */
export async function getIceServers(customIdentifier?: string): Promise<IceServer[]> {
  const keyId = process.env.CLOUDFLARE_TURN_KEY_ID;
  const apiToken = process.env.CLOUDFLARE_TURN_KEY_API_TOKEN;

  if (!keyId || !apiToken) {
    console.warn(
      "[turn] CLOUDFLARE_TURN_KEY_ID / CLOUDFLARE_TURN_KEY_API_TOKEN absents — repli sur STUN public (pas de relais TURN).",
    );
    return FALLBACK_ICE_SERVERS;
  }

  try {
    const res = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate-ice-servers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          customIdentifier
            ? { ttl: TURN_CREDENTIAL_TTL, customIdentifier }
            : { ttl: TURN_CREDENTIAL_TTL },
        ),
        cache: "no-store", // credentials éphémères, uniques par requête
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[turn] Cloudflare a renvoyé ${res.status} : ${detail}`);
      return FALLBACK_ICE_SERVERS;
    }

    const data = (await res.json()) as { iceServers?: IceServer[] };
    if (!data.iceServers || data.iceServers.length === 0) {
      return FALLBACK_ICE_SERVERS;
    }
    return data.iceServers;
  } catch (err) {
    console.error("[turn] échec de la génération des credentials TURN :", err);
    return FALLBACK_ICE_SERVERS;
  }
}
