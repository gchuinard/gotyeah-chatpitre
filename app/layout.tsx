import type { Metadata } from "next";
import {
  Abril_Fatface,
  Inter,
  Playfair_Display,
  Special_Elite,
} from "next/font/google";
import "./globals.css";

// Typographie « affiche de cabaret » :
// - Abril Fatface, display dramatique pour les très gros titres
// - Playfair Display, serif éditoriale (+ italique) pour les sous-titres
// - Inter, corps de texte et formulaires
// - Special Elite, mono « machine à écrire » pour les mentions ticket
//
// Les `variable` exposent les fontes en CSS custom property sur <html> ;
// globals.css les récupère via `var(--font-cp-*)` dans `@theme`.
const abril = Abril_Fatface({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cp-display",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-cp-serif",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cp-body",
});

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cp-mono",
});

export const metadata: Metadata = {
  title: "Le Chat-Pitre",
  description:
    "Maison de villégiature pour chats de bonne compagnie — réservation en ligne.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${abril.variable} ${playfair.variable} ${inter.variable} ${specialElite.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
