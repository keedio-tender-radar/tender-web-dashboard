import type { Metadata, Viewport } from "next";
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
  title: {
    default: "Keedio Tender Radar",
    template: "%s · Keedio Tender Radar",
  },
  description:
    "Inteligencia de contratación pública: radar diario de licitaciones con IA, scoring Go/No-Go y análisis de mercado.",
  applicationName: "Keedio Tender Radar",
  openGraph: {
    title: "Keedio Tender Radar",
    description: "Inteligencia de contratación pública con IA: detecta, puntúa y decide.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <NavBar />
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
          <AuthGate>{children}</AuthGate>
        </main>
        <footer className="mx-auto max-w-6xl px-5 pb-8 text-xs text-neutral-500 sm:px-6">
          <span>Keedio Tender Radar · Uso interno y confidencial</span>
          <span aria-hidden className="mx-2 text-neutral-700">
            ·
          </span>
          <a href="/legal" className="hover:text-brand">
            Aviso legal y privacidad
          </a>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
