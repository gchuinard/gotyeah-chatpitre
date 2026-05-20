import { NextResponse, type NextRequest } from "next/server";
import { destroySession } from "@/lib/auth";

/// POST /api/auth/logout — ferme la session et redirige vers /login.
/// Appelé depuis un simple <form> : on renvoie une redirection 303 (POST → GET).
export async function POST(req: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL("/login", req.url), 303);
}
