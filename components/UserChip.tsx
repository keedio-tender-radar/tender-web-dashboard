"use client";

import { useEffect, useState } from "react";

import { User } from "lucide-react";

// Identidad ligera del usuario (sin login): se guarda en localStorage y se envía como `actor`
// en acciones, decisiones y notas para tener trazabilidad de quién hizo qué.
export function UserChip() {
  const [name, setName] = useState("");

  useEffect(() => setName(localStorage.getItem("ktr_user") || ""), []);

  function change() {
    const v = window.prompt("Tu nombre o iniciales (para atribuir tus acciones):", name);
    if (v !== null) {
      const trimmed = v.trim();
      localStorage.setItem("ktr_user", trimmed);
      setName(trimmed);
    }
  }

  return (
    <button
      onClick={change}
      title="Cambiar identidad"
      className="ml-auto flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-neutral-300 transition-colors hover:border-brand"
    >
      <User className="h-3.5 w-3.5" />
      {name || "Identifícate"}
    </button>
  );
}
