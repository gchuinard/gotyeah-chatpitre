import { Button } from "@/components/ui/button";

/// Bouton de déconnexion : un simple <form> qui POST vers la route de logout.
export function LogoutForm() {
  return (
    <form action="/api/auth/logout" method="post">
      <Button type="submit" variant="outline" size="sm">
        Déconnexion
      </Button>
    </form>
  );
}
