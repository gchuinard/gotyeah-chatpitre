import type { Metadata } from "next";
import { Bodoni_Moda, Inter, Space_Mono } from "next/font/google";
import "./globals.css";

// Typographie « brutalist editorial » :
// - Bodoni Moda (variable, opsz + ital) → display ET serif, didone à fort
//   contraste, qui porte les très grands titres et les noms italiques.
// - Inter (variable) → corps de texte, navigation, formulaires.
// - Space Mono → mentions catalogue, numéros, métadonnées « fiche ».
//
// Les `variable` exposent les fontes en CSS custom property sur <html> ;
// globals.css les remappe sur `--font-display` / `--font-body` / `--font-mono`
// via `@theme`.
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-cp-display",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cp-body",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
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
      className={`${bodoniModa.variable} ${inter.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
