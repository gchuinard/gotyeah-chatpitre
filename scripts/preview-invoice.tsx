// Rend la facture en PDF hors application, avec des données fabriquées.
//
// lib/invoice-pdf.tsx n'importe ni Tailwind ni lightningcss : c'est le seul
// écran du projet observable sans base de données ni session. Ce script existe
// pour pouvoir REGARDER la facture au lieu d'en deviner la mise en page.
//
//   node ./node_modules/tsx/dist/cli.mjs ./scripts/preview-invoice.tsx sortie.pdf
//
// Le jeu de données pousse volontairement les cas longs : nom de famille à
// rallonge, deux chats, deux suppléments. C'est là que les en-têtes se replient
// et que les chevauchements apparaissent, s'il y en a.
import { renderToFile } from "@react-pdf/renderer";
import { InvoicePdf } from "@/lib/invoice-pdf";

const d = (s: string) => new Date(s);

// Cast souples : on ne fabrique que les champs réellement lus par le rendu,
// pas des entités Prisma complètes.
const booking = {
  id: "cmrr000000000000000abcde",
  startDate: d("2026-08-03"),
  endDate: d("2026-08-12"),
  totalAmount: 342,
  depositAmount: 102.6,
  pricePerFirstCat: 26,
  pricePerExtraCat: 12,
  depositPercentage: 30,
  extras: [
    { id: "e1", label: "Soins quotidiens (insuline)", amount: 54, unitAmount: 6, unit: "PER_DAY", quantity: 1 },
    { id: "e2", label: "Toilettage au départ", amount: 24, unitAmount: 24, unit: "FLAT", quantity: 1 },
  ],
} as never;

const client = {
  firstName: "Marguerite",
  lastName: "Vandenbossche-Delacroix",
  email: "marguerite.vandenbossche@example.com",
  phone: "06 12 34 56 78",
} as never;

const cats = [
  { id: "c1", name: "Pamplemousse", breed: "Chartreux" },
  { id: "c2", name: "Croquette", breed: null },
] as never;

const out = process.argv[2] ?? "facture.pdf";

// IIFE et non await racine : tsx transpile en CommonJS, qui ne l'accepte pas.
void (async () => {
  await renderToFile(
    InvoicePdf({ booking, client, cats, issuedAt: "23 juillet 2026" }) as never,
    out,
  );
  console.log("écrit :", out);
})();
