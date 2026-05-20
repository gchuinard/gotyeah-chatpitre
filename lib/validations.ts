import { z } from "zod";

// Schémas de validation Zod des entrées des routes API.
// Les schémas des chats, réservations, etc. sont ajoutés au fil des étapes.

// --- Authentification -------------------------------------------------------

export const signupSchema = z.object({
  email: z.email("Email invalide."),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
  firstName: z.string().trim().min(1, "Le prénom est requis."),
  lastName: z.string().trim().min(1, "Le nom est requis."),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  city: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.email("Email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

// --- Utilitaire -------------------------------------------------------------

/// Transforme une ZodError en un objet plat { champ: message } facile à
/// renvoyer au client.
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
