import Link from "next/link";

import { AdminCatsTable, type AdminCatRow } from "@/components/admin-cats-table";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { prisma } from "@/lib/db";
import { ageLabel } from "@/lib/repository";

/// Liste des pensionnaires côté administration.
///
/// La fiche d'un chat existait déjà, mais aucune page ne permettait d'y arriver
/// autrement qu'en passant par son propriétaire ou par un séjour. Or au
/// téléphone, on parle d'abord du chat.

export default async function AdminCatsPage() {
  // startOfDay et endOfDay bornent la journée courante : un séjour du 20 au 28
  // « couvre aujourd'hui » si sa date de début est passée et sa date de fin à
  // venir. La comparaison se fait sur des instants, donc les bornes comptent.
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const cats = await prisma.cat.findMany({
    orderBy: { name: "asc" },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true } },
      bookingCats: {
        select: {
          booking: {
            select: { status: true, startDate: true, endDate: true },
          },
        },
      },
    },
  });

  const rows: AdminCatRow[] = cats.map((cat) => {
    const bookings = cat.bookingCats.map((b) => b.booking);
    return {
      id: cat.id,
      name: cat.name,
      identity: [
        cat.sex === "MALE" ? "Mâle" : "Femelle",
        cat.breed,
        ageLabel(cat.birthDate),
      ]
        .filter(Boolean)
        .join(" · "),
      ownerId: cat.owner.id,
      ownerName: `${cat.owner.firstName} ${cat.owner.lastName}`,
      bookingCount: bookings.length,
      // Seuls les séjours ACCEPTÉS comptent : une demande en attente qui
      // couvre aujourd'hui ne veut pas dire que le chat est dans la maison.
      inHouse: bookings.some(
        (b) =>
          b.status === "ACCEPTED" &&
          b.startDate < dayEnd &&
          b.endDate >= dayStart,
      ),
      passedAway: cat.passedAwayAt !== null,
    };
  });

  const inHouseCount = rows.filter((r) => r.inHouse).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/admin" className="hover:text-cp-paprika">
          Administration
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Pensionnaires</span>
      </nav>

      <header className="space-y-5">
        <LibraryStamp boxed>Registre des pensionnaires</LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Tous les chats.
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          {rows.length} fiche{rows.length > 1 ? "s" : ""} au registre
          {inHouseCount > 0
            ? `, dont ${inHouseCount} en séjour aujourd'hui.`
            : ", personne en séjour aujourd'hui."}
        </p>
      </header>

      <RuleDivider className="my-12" tone="paprika" />

      <AdminCatsTable cats={rows} />
    </div>
  );
}
