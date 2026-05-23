"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/// Menu utilisateur dans l'en-tête : pastille d'initiales + nom + chevron.
/// Dropdown brutalist editorial avec liens vers les sections personnelles
/// et bouton de déconnexion (POST /api/auth/logout via fetch + refresh).

export function UserMenu({
  firstName,
  lastName,
  email,
  links,
}: {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  links: { href: string; label: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const initials = computeInitials(firstName, lastName, email);
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || email;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        className="group flex items-center gap-3 border border-cp-ink/40 bg-cp-paper px-3 py-1.5 text-cp-ink outline-none transition-colors hover:border-cp-ink hover:bg-cp-ink hover:text-cp-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cp-paprika"
      >
        <span
          aria-hidden
          className="grid size-7 place-items-center border border-current font-mono text-[0.7rem] font-bold uppercase tracking-[0.06em]"
        >
          {initials}
        </span>
        <span className="hidden font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] sm:inline">
          {displayName}
        </span>
        <ChevronDown
          className="size-3 transition-transform group-data-[popup-open]:rotate-180"
          strokeWidth={2}
          aria-hidden
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end">
          <Menu.Popup className="w-60 border border-cp-ink bg-cp-paper text-cp-ink shadow-[6px_6px_0_0_var(--color-cp-ink)] outline-none">
            <div className="border-b border-cp-ink px-4 py-3">
              <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
                § fiche personnelle
              </p>
              <p className="mt-1 font-display text-base italic leading-tight text-cp-ink">
                {displayName}
              </p>
              <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-cp-ink-soft">
                {email}
              </p>
            </div>

            <ul className="border-b border-cp-ink/30 py-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Menu.Item
                    render={<a href={l.href} />}
                    className={menuItemClass}
                  >
                    {l.label}
                  </Menu.Item>
                </li>
              ))}
            </ul>

            <Menu.Item
              onClick={logout}
              disabled={pending}
              className={cn(menuItemClass, "text-cp-paprika hover:text-cp-paper hover:bg-cp-paprika")}
            >
              {pending ? "Déconnexion…" : "Se déconnecter ↗"}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

const menuItemClass =
  "block w-full cursor-pointer select-none px-4 py-2 font-body text-sm text-cp-ink outline-none transition-colors hover:bg-cp-paper-deep data-[highlighted]:bg-cp-paper-deep data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

function computeInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string,
): string {
  const first = firstName?.trim().charAt(0).toUpperCase();
  const last = lastName?.trim().charAt(0).toUpperCase();
  if (first || last) return `${first ?? ""}${last ?? ""}` || "·";
  return email?.charAt(0).toUpperCase() ?? "·";
}
