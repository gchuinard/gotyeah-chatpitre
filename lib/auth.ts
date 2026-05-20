import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  createSessionToken,
  isAdminEmail,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  verifySessionToken,
} from "@/lib/auth-shared";

// Authentification maison : mot de passe haché (bcrypt) + cookie de session
// signé (cf. lib/auth-shared.ts). À utiliser côté serveur uniquement.

const BCRYPT_ROUNDS = 10;

// --- Mots de passe ----------------------------------------------------------

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// --- Session (cookie) -------------------------------------------------------
// createSession / destroySession écrivent un cookie : à n'appeler que depuis
// un Route Handler ou une Server Action (jamais depuis un Server Component).

/// Ouvre une session pour cet utilisateur (pose le cookie).
export async function createSession(user: Pick<User, "id" | "email">): Promise<void> {
  const token = createSessionToken(user.id, user.email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

/// Ferme la session courante (supprime le cookie).
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/// Renvoie l'utilisateur courant d'après le cookie de session, sinon null.
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  return prisma.user.findUnique({ where: { id: payload.userId } });
}

// --- Admin ------------------------------------------------------------------

/// Indique si l'utilisateur a les droits admin (email dans ADMIN_EMAILS).
export function isAdmin(user: Pick<User, "email"> | null | undefined): boolean {
  return user ? isAdminEmail(user.email) : false;
}
