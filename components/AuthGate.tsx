"use client";

import { useEffect, useState } from "react";

import { ArrowRight, Lock } from "lucide-react";

import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";

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
      const { ok, token } = await api.authCheck(pw);
      if (ok) {
        localStorage.setItem("ktr_auth", "1");
        // Si la API exige token en las lecturas, lo guardamos para enviarlo en cada petición.
        if (token) localStorage.setItem("ktr_api_token", token);
        setState("ok");
      } else {
        setError("Contraseña incorrecta.");
      }
    } catch (e) {
      setError(String(e));
    }
  }

  if (state === "loading")
    return (
      <div className="mt-24 flex justify-center">
        <Logo className="h-10 w-10 animate-pulse" />
      </div>
    );
  if (state === "ok") return <>{children}</>;

  return (
    <div className="mx-auto mt-16 w-full max-w-sm sm:mt-24">
      <div className="card flex flex-col gap-6 p-7">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo className="h-14 w-14" />
          <div>
            <h1 className="font-display text-xl font-bold">Keedio Tender Radar</h1>
            <p className="mt-1 text-sm text-neutral-400">Inteligencia de contratación pública</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-neutral-400">
            Contraseña de acceso
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="password"
              autoFocus
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[var(--border)] bg-[#0b1020] py-2 pl-9 pr-3 text-sm"
            />
          </div>
          {error && <p className="text-sm text-rose-300">{error}</p>}
        </div>
        <button
          onClick={submit}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Entrar <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-neutral-600">Plataforma interna · Keedio</p>
    </div>
  );
}
