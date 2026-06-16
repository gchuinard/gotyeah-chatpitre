import { randomUUID } from "node:crypto";

// Bus de signaling WebRTC EN MÉMOIRE pour les télé-rendez-vous.
//
// Les deux pairs d'un appel (client + maison) échangent leurs offres/réponses
// SDP et leurs candidats ICE via ce bus : chaque pair s'abonne au canal du rdv
// par un flux SSE (joinRoom) et publie ses messages par POST (publishSignal).
// L'état échangé est VOLATILE — jamais persisté en base.
//
// Singleton sur globalThis : survit au hot-reload en dev et reste unique dans
// le conteneur de prod (déploiement mono-instance). Toute mise à l'échelle
// horizontale casserait ce bus — contrainte assumée.

export type PeerRole = "client" | "admin";

export type Peer = {
  connectionId: string;
  role: PeerRole;
};

/// Évènements poussés vers un pair sur son flux SSE.
export type SignalingEvent =
  | { type: "ready"; connectionId: string; peers: Peer[] }
  | { type: "peer-joined"; peer: Peer }
  | { type: "peer-left"; peer: Peer }
  | {
      type: "signal";
      from: string;
      kind: string;
      sdp?: string;
      candidate?: unknown;
      text?: string;
    };

type Subscriber = Peer & {
  send: (event: SignalingEvent) => void;
};

// connectionId -> abonné. Un canal (Map) par rdv.
type Room = Map<string, Subscriber>;

const globalForSignaling = globalThis as unknown as {
  __rdvSignalingRooms?: Map<string, Room>;
};
const rooms: Map<string, Room> = (globalForSignaling.__rdvSignalingRooms ??= new Map());

/**
 * Inscrit un pair au canal d'un rdv. Lui envoie aussitôt un évènement `ready`
 * (son id de connexion + les pairs déjà présents) et notifie les autres de son
 * arrivée. Renvoie `connectionId` et une fonction `leave()` à appeler à la
 * déconnexion (abort du flux SSE) pour éviter toute fuite d'abonné.
 */
export function joinRoom(
  roomId: string,
  peer: { role: PeerRole; send: (event: SignalingEvent) => void },
): { connectionId: string; leave: () => void } {
  const connectionId = randomUUID();

  let room = rooms.get(roomId);
  if (!room) {
    room = new Map();
    rooms.set(roomId, room);
  }

  const existingPeers: Peer[] = [...room.values()].map((s) => ({
    connectionId: s.connectionId,
    role: s.role,
  }));

  room.set(connectionId, { connectionId, role: peer.role, send: peer.send });

  // Le nouvel arrivant reçoit son id + la présence existante.
  peer.send({ type: "ready", connectionId, peers: existingPeers });

  // Les pairs déjà là sont notifiés de l'arrivée.
  const self: Peer = { connectionId, role: peer.role };
  for (const s of room.values()) {
    if (s.connectionId !== connectionId) s.send({ type: "peer-joined", peer: self });
  }

  const leave = () => {
    const r = rooms.get(roomId);
    if (!r || !r.delete(connectionId)) return;
    for (const s of r.values()) s.send({ type: "peer-left", peer: self });
    if (r.size === 0) rooms.delete(roomId);
  };

  return { connectionId, leave };
}

/**
 * Relaie un message de signaling à tous les pairs du canal SAUF l'émetteur
 * (identifié par son `from` = connectionId), pour ne pas lui renvoyer l'écho.
 */
export function publishSignal(
  roomId: string,
  from: string,
  message: { kind: string; sdp?: string; candidate?: unknown; text?: string },
): void {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const s of room.values()) {
    if (s.connectionId === from) continue;
    s.send({ type: "signal", from, ...message });
  }
}
