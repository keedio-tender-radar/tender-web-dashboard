"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/Logo";

const LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Radar" },
  { href: "/tenders", label: "Licitaciones" },
  { href: "/seguimiento", label: "Seguimiento" },
  { href: "/expedientes", label: "Expedientes" },
  { href: "/market", label: "Mercado" },
  { href: "/alerts", label: "Alertas" },
  { href: "/ask", label: "Pregúntale al pliego" },
  { href: "/profile", label: "Perfil" },
  { href: "/status", label: "Estado" },
];

export function NavBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(10,14,26,0.8)] backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-[0.95rem] font-bold tracking-tight"
        >
          <Logo className="h-7 w-7" />
          Keedio Tender Radar
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {LINKS.slice(1).map((l) => (
            <Link key={l.href} href={l.href} className="nav-link" data-active={isActive(l.href)}>
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
