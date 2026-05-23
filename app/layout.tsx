import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Newsreader } from "next/font/google";
import "./globals.css";

// Typographie « mid-century illustré » :
// - Newsreader (variable, opsz + italic) → serif chaleureux, italique
//   expressive, presence sur les très gros titres.
// - Manrope (variable) → grotesque géométrique chaleureux, corps de
//   texte, navigation, formulaires.
// - JetBrains Mono → mentions catalogue, numéros, métadonnées.
//
// Les `variable` exposent les fontes en CSS custom property sur <html>.
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-cp-display",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cp-body",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-cp-mono",
});

export const metadata: Metadata = {
  title: "Le Chat-Pitre",
  description:
    "Maison de villégiature pour félins de bonne compagnie — réservation en ligne.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${newsreader.variable} ${manrope.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
