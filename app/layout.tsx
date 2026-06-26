import type { Metadata } from "next";

import "./globals.css";
import { AuthGate } from "@/components/AuthGate";
import { NavBar } from "@/components/NavBar";
import { Toaster } from "@/components/Toaster";

export const metadata: Metadata = {
  title: "Keedio Tender Radar",
  description: "Inteligencia de contratación pública: radar diario de licitaciones con IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <NavBar />
        <main className="mx-auto max-w-6xl px-5 py-8">
          <AuthGate>{children}</AuthGate>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
