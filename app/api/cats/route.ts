import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handle, json, parseJson, requireUser } from "@/lib/api";
import { catCreateSchema } from "@/lib/validations";

/// GET /api/cats — liste les chats de l'utilisateur courant.
export function GET() {
  return handle(async () => {
    const user = await requireUser();
    const cats = await prisma.cat.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return json({ cats });
  });
}

/// POST /api/cats — crée une fiche chat pour l'utilisateur courant.
export function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const data = await parseJson(req, catCreateSchema);
    const cat = await prisma.cat.create({
      data: { ...data, ownerId: user.id },
    });
    return json({ cat }, 201);
  });
}
