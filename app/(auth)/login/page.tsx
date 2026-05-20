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
  const next =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/dashboard";

  return <LoginForm next={next} />;
}
