import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { AuthGate } from "@/components/AuthGate";
import { NavBar } from "@/components/NavBar";
import { Toaster } from "@/components/Toaster";

// UI/cuerpo: Inter (humanista, óptima para datos). Titulares: Space Grotesk (geométrica) →
// pareja en eje de contraste. Self-hosted por next/font (sin request externo, cero layout-shift).
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Keedio Tender Radar",
  description: "Inteligencia de contratación pública: radar diario de licitaciones con IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <NavBar />
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
          <AuthGate>{children}</AuthGate>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
