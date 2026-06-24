import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Keedio Tender Radar",
  description: "Inteligencia de contratación pública: radar diario de licitaciones con IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="border-b border-neutral-800">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-5 py-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span>📡</span> Keedio Tender Radar
            </Link>
            <Link href="/" className="text-sm text-neutral-400 hover:text-white">
              Radar
            </Link>
            <Link href="/tenders" className="text-sm text-neutral-400 hover:text-white">
              Licitaciones
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
