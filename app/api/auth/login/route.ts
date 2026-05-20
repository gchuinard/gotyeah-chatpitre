import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
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
  return NextResponse.json({
    user: { id: user.id, email: user.email, firstName: user.firstName },
  });
}
