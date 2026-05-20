import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail, SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth-shared";

// Proxy (ex-« middleware », renommé dans Next 16) : protège les espaces
// authentifiés.
//   - /dashboard/** : session valide requise
//   - /admin/**     : session valide ET email admin requis
//
// Le Proxy s'exécute sur le runtime Node.js par défaut : le module `crypto`,
// utilisé pour vérifier le jeton de session, y est disponible. (L'option
// `runtime` n'est pas autorisée dans un fichier proxy.)
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin", "/admin/:path*"],
};

export function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  // Pas de session valide → redirection vers /login (cible mémorisée).
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Zone /admin : l'email doit figurer dans ADMIN_EMAILS.
  if (req.nextUrl.pathname.startsWith("/admin") && !isAdminEmail(session.email)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
