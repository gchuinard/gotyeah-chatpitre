import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, isAdmin, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

/// POST /api/auth/login — vérifie les identifiants et ouvre la session.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email ou mot de passe manquant." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Message volontairement générique : ne révèle pas si l'email existe.
  const invalid = NextResponse.json(
    { error: "Email ou mot de passe incorrect." },
    { status: 401 },
  );
  if (!user) return invalid;

  const passwordOk = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!passwordOk) return invalid;

  await createSession(user);
  // La destination est calculée ICI, et pas dans le formulaire.
  //
  // Le formulaire est un composant client, alors qu'isAdmin() lit la variable
  // d'environnement ADMIN_EMAILS, qui est serveur. Faire le test côté navigateur
  // supposerait de lui livrer la liste des emails d'administration, autrement
  // dit de publier la porte d'entrée de l'administration. Le serveur tranche et
  // le formulaire se contente de suivre.
  return NextResponse.json({
    user: { id: user.id, email: user.email, firstName: user.firstName },
    redirectTo: isAdmin(user) ? "/admin" : "/dashboard",
  });
}
