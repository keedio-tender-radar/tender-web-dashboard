"use client";

import { useEffect, useState } from "react";

type Kind = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  kind: Kind;
}

// API global sin prop-drilling: toast("Guardado") desde cualquier componente cliente.
export function toast(message: string, kind: Kind = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ktr-toast", { detail: { message, kind } }));
}

const STYLES: Record<Kind, string> = {
  success: "border-emerald-500/40 bg-emerald-950/80 text-emerald-100",
  error: "border-red-500/40 bg-red-950/80 text-red-100",
  info: "border-[var(--border)] bg-[var(--surface-2)] text-neutral-100",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let n = 0;
    function onToast(e: Event) {
      const { message, kind } = (e as CustomEvent).detail as { message: string; kind: Kind };
      const id = ++n;
      setToasts((ts) => [...ts, { id, message, kind }]);
      setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 3500);
    }
    window.addEventListener("ktr-toast", onToast);
    return () => window.removeEventListener("ktr-toast", onToast);
  }, []);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`fade-up pointer-events-auto max-w-xs rounded-xl border px-4 py-2.5 text-sm shadow-lg backdrop-blur ${STYLES[t.kind]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
