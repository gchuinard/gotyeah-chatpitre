import crypto from "crypto";

// Primitives d'authentification « pures » : jeton de session signé et test du
// statut admin. Aucune dépendance à Next, Prisma ou bcrypt — ce module est
// donc importable aussi bien depuis lib/auth.ts que depuis le middleware.

export const SESSION_COOKIE_NAME = "session";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
export const SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;

export interface SessionPayload {
  userId: string;
  email: string;
  exp: number; // expiration, timestamp en millisecondes
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET doit être défini et faire au moins 32 caractères " +
        "(générer avec : openssl rand -hex 32).",
    );
  }
  return secret;
}

function b64urlEncode(value: string): string {
  return Buffer.from(value, "utf-8").toString("base64url");
}

function b64urlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function hmacSign(data: string): string {
  return crypto.createHmac("sha256", getAuthSecret()).update(data).digest("base64url");
}

/// Construit un jeton de session (JWT signé HMAC-SHA256) pour un utilisateur.
export function createSessionToken(userId: string, email: string): string {
  const payload: SessionPayload = {
    userId,
    email,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const header = b64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64urlEncode(JSON.stringify(payload));
  const signature = hmacSign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

/// Vérifie un jeton de session ; renvoie le payload s'il est valide et non
/// expiré, sinon null.
export function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const expected = hmacSign(`${header}.${body}`);
  const signatureBuf = Buffer.from(signature, "base64url");
  const expectedBuf = Buffer.from(expected, "base64url");
  // Comparaison à temps constant pour éviter les attaques temporelles.
  if (signatureBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(signatureBuf, expectedBuf)) return null;

  try {
    const payload = JSON.parse(b64urlDecode(body)) as SessionPayload;
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/// Indique si un email a les droits admin (présence dans ADMIN_EMAILS, une
/// liste d'emails séparés par des virgules, insensible à la casse).
export function isAdminEmail(email: string): boolean {
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.trim().toLowerCase());
}
