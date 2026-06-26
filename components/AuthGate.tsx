"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

// Gate de UI: si la API tiene DASHBOARD_PASSWORD, pide contraseña antes de mostrar el dashboard.
// Si no está configurada, no molesta (acceso libre). El flag se guarda en localStorage.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "ok" | "need">("loading");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("ktr_auth") === "1") {
      setState("ok");
      return;
    }
    api
      .authStatus()
      .then((s) => setState(s.enabled ? "need" : "ok"))
      .catch(() => setState("ok")); // si la API no responde, no bloqueamos
  }, []);

  async function submit() {
    setError(null);
    try {
      const { ok } = await api.authCheck(pw);
      if (ok) {
        localStorage.setItem("ktr_auth", "1");
        setState("ok");
      } else {
        setError("Contraseña incorrecta.");
      }
    } catch (e) {
      setError(String(e));
    }
  }

  if (state === "loading") return <p className="text-neutral-500">…</p>;
  if (state === "ok") return <>{children}</>;

  return (
    <div className="mx-auto mt-16 flex max-w-sm flex-col gap-3">
      <h1 className="text-xl font-bold">Keedio Tender Radar</h1>
      <p className="text-sm text-neutral-400">Acceso restringido. Introduce la contraseña.</p>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="rounded-lg border border-neutral-700 bg-[#0b1020] px-3 py-2 text-sm"
      />
      <button
        onClick={submit}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Entrar
      </button>
    </div>
  );
}
