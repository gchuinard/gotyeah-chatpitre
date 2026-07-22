import { LoginForm } from "./login-form";

/// Page de connexion. Lit la cible de redirection (?next=) et la transmet au
/// formulaire (composant client).
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  // On n'accepte qu'un chemin interne comme cible (anti open-redirect).
  //
  // undefined et non "/dashboard" par défaut : sans cette distinction, on ne
  // saurait plus si la cible a été DEMANDÉE ou simplement supposée, et le
  // serveur ne pourrait jamais envoyer une administration vers /admin.
  const next =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : undefined;

  return <LoginForm next={next} />;
}
