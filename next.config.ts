import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Génère un bundle serveur autonome dans .next/standalone : l'image Docker
  // de prod ne contient que les modules réellement importés (runtime allégé).
  output: "standalone",
};

export default nextConfig;
