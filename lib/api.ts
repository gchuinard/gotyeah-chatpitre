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

/// Statuts pour lesquels un séjour est clôturé : la fiche passe en lecture
/// seule et n'accepte plus d'écriture éditoriale (fil, avis pensionnaires,
/// carnet, télé-rendez-vous). « Refusé » n'en fait volontairement PAS partie :
/// après un refus l'échange continue, c'est ce que promet la confirmation de
/// refus affichée à l'utilisateur.
export const CLOSED_BOOKING_STATUSES = ["CANCELLED", "COMPLETED"] as const;

export function isBookingClosed(status: string): boolean {
  return (CLOSED_BOOKING_STATUSES as readonly string[]).includes(status);
}

/// Statuts pour lesquels un séjour quitte la file de travail et part à
/// l'archive au bout d'un délai. À NE PAS CONFONDRE avec les statuts clôturés
/// ci-dessus : « Refusé » s'archive, parce qu'une demande refusée n'a plus rien
/// à voir avec le travail courant, mais reste ÉCRIVABLE, parce que la
/// confirmation de refus promet à l'utilisateur que l'échange continue. Ranger
/// et verrouiller sont deux gestes différents.
export const ARCHIVABLE_BOOKING_STATUSES = [
  "CANCELLED",
  "COMPLETED",
  "REJECTED",
] as const;

export function isBookingArchivable(status: string): boolean {
  return (ARCHIVABLE_BOOKING_STATUSES as readonly string[]).includes(status);
}

/// L'encaissement est le seul geste encore permis sur un séjour TERMINÉ : le
/// solde peut être réglé après le départ des chats, et rien dans l'interface ne
/// permettrait de rouvrir le séjour pour le saisir. Il reste refusé sur un
/// séjour ANNULÉ, qui est totalement figé. On ne peut donc pas se contenter
/// d'`assertBookingWritable` ici, qui refuserait les deux.
export function assertPaymentWritable(status: string): void {
  if (status === "CANCELLED") {
    throw new HttpError(
      409,
      "Ce séjour est annulé, il n'accepte plus d'encaissement.",
    );
  }
}

/// Délai au-delà duquel un séjour clôturé quitte la liste de travail.
export const ARCHIVE_AFTER_DAYS = 30;

/// Vrai si le séjour est rangé à l'archive. Le décompte part de la DATE DE
/// CLÔTURE et non de la date de fin du séjour ni de `updatedAt` : ce dernier
/// bouge à chaque écriture, et l'encaissement d'un solde reste permis sur un
/// séjour terminé, ce qui aurait fait ressortir de l'archive un séjour clos
/// depuis des mois.
///
/// Sans date de clôture, le séjour reste VISIBLE. La règle échoue ainsi du bon
/// côté : mieux vaut un séjour de trop dans la liste de travail qu'un séjour
/// disparu de la vue.
export function isBookingArchived(
  status: string,
  closedAt: Date | null,
): boolean {
  if (!isBookingArchivable(status)) return false;
  if (!closedAt) return false;
  return Date.now() - closedAt.getTime() > ARCHIVE_AFTER_DAYS * 86_400_000;
}

/// Lève un 409 si le séjour est clôturé. À appeler dans TOUTE route qui écrit
/// sur un séjour : le verrou d'interface est rendu au moment du rendu serveur,
/// donc périmé dès qu'un onglet reste ouvert pendant que le statut change.
export function assertBookingWritable(status: string): void {
  if (isBookingClosed(status)) {
    throw new HttpError(409, "Ce séjour est clôturé, il est en lecture seule.");
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
