import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import type { User } from "@prisma/client";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { zodFieldErrors } from "@/lib/validations";

// Helpers pour des routes API homogènes : réponses JSON, gestion d'erreur
// centralisée et gardes d'authentification.

/// Réponse JSON de succès.
export function json<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/// Réponse JSON d'erreur.
export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/// Erreur applicative portant un code HTTP. Capturée par handle().
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/// Renvoie l'utilisateur courant, ou lève une HttpError 401.
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Authentification requise.");
  return user;
}

/// Renvoie l'utilisateur courant et exige le statut admin (403 sinon).
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (!isAdmin(user)) {
    throw new HttpError(403, "Accès réservé aux administrateurs.");
  }
  return user;
}

/// Lit le corps JSON de la requête et le valide avec un schéma Zod.
/// Lève HttpError 400 si le JSON est illisible, ZodError si la validation
/// échoue (toutes deux transformées en réponse propre par handle()).
export async function parseJson<S extends z.ZodType>(
  req: Request,
  schema: S,
): Promise<z.infer<S>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, "Corps de requête JSON invalide.");
  }
  return schema.parse(raw);
}

/// Enveloppe un handler de route : transforme HttpError, ZodError et erreurs
/// inattendues en réponses JSON cohérentes.
export async function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof HttpError) return apiError(err.message, err.status);
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides.", fields: zodFieldErrors(err) },
        { status: 400 },
      );
    }
    console.error("[api] erreur non gérée :", err);
    return apiError("Erreur interne du serveur.", 500);
  }
}
