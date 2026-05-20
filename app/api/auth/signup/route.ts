import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { signupSchema, zodFieldErrors } from "@/lib/validations";

/// POST /api/auth/signup — crée un compte propriétaire et ouvre la session.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", fields: zodFieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const email = data.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email." },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(data.password),
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      address: data.address || null,
      postalCode: data.postalCode || null,
      city: data.city || null,
    },
  });

  // Connexion automatique juste après l'inscription.
  await createSession(user);

  return NextResponse.json(
    { user: { id: user.id, email: user.email, firstName: user.firstName } },
    { status: 201 },
  );
}
