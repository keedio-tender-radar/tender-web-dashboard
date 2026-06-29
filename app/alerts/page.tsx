"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { api, type SavedAlert } from "@/lib/api";
import { toast } from "@/components/Toaster";

type Match = { tender: { id: string; title: string; source: string }; alerts: string[] };

const EMPTY = { name: "", min_score: "", cpv_prefix: "", min_budget: "", source: "", traffic_light: "", q: "" };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<SavedAlert[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);

  function reload() {
    api.listAlerts().then(setAlerts).catch((e) => setError(String(e)));
    api.alertMatches(7).then((m) => setMatches(m as Match[])).catch(() => setMatches([]));
  }
  useEffect(reload, []);

  async function create() {
    if (!form.name.trim()) return toast("Pon un nombre a la alerta", "error");
    try {
      await api.createAlert({
        name: form.name.trim(),
        min_score: form.min_score ? Number(form.min_score) : null,
        cpv_prefix: form.cpv_prefix || null,
        min_budget: form.min_budget ? Number(form.min_budget) : null,
        source: form.source || null,
        traffic_light: form.traffic_light || null,
        q: form.q || null,
      });
      setForm({ ...EMPTY });
      toast("Alerta creada");
      reload();
    } catch (e) {
      toast(String(e), "error");
    }
  }

  async function remove(id: string) {
    await api.deleteAlert(id);
    toast("Alerta eliminada");
    reload();
  }

  const inputCls =
    "rounded-lg border border-[var(--border)] bg-[#0b1020] px-3 py-2 text-sm";

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Alertas a medida</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Guarda criterios (CPV, score, presupuesto…) y recibe las licitaciones que coincidan.
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}

      <div className="card flex flex-col gap-3">
        <h2 className="font-semibold">Nueva alerta</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input className={inputCls} placeholder="Nombre*" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inputCls} placeholder="CPV (prefijo, p. ej. 72)" value={form.cpv_prefix}
            onChange={(e) => setForm({ ...form, cpv_prefix: e.target.value })} />
          <input className={inputCls} type="number" placeholder="Score mínimo" value={form.min_score}
            onChange={(e) => setForm({ ...form, min_score: e.target.value })} />
          <input className={inputCls} type="number" placeholder="Presupuesto mínimo (€)"
            value={form.min_budget}
            onChange={(e) => setForm({ ...form, min_budget: e.target.value })} />
          <input className={inputCls} placeholder="Palabra en el título" value={form.q}
            onChange={(e) => setForm({ ...form, q: e.target.value })} />
          <select className={inputCls} value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}>
            <option value="">Cualquier fuente</option>
            <option value="placsp">PLACSP</option>
            <option value="ted">TED</option>
          </select>
          <select className={inputCls} value={form.traffic_light}
            onChange={(e) => setForm({ ...form, traffic_light: e.target.value })}>
            <option value="">Cualquier semáforo</option>
            <option value="green">🟢 Prioritaria</option>
            <option value="yellow">🟡 Revisar</option>
          </select>
          <button onClick={create}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Crear alerta
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-2 font-semibold">Tus alertas ({alerts.length})</h2>
        {alerts.length === 0 ? (
          <p className="text-sm text-neutral-500">Aún no hay alertas.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  <span className="font-medium">{a.name}</span>{" "}
                  <span className="text-neutral-500">
                    {[
                      a.cpv_prefix && `CPV ${a.cpv_prefix}`,
                      a.min_score != null && `score≥${a.min_score}`,
                      a.min_budget != null && `≥${a.min_budget.toLocaleString("es-ES")}€`,
                      a.source, a.traffic_light, a.q && `"${a.q}"`,
                    ].filter(Boolean).join(" · ") || "sin filtros"}
                  </span>
                </span>
                <button onClick={() => remove(a.id)}
                  className="text-neutral-400 hover:text-rose-300">Eliminar</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="mb-2 font-semibold">Coincidencias (últimos 7 días) · {matches.length}</h2>
        {matches.length === 0 ? (
          <p className="text-sm text-neutral-500">Ninguna licitación reciente coincide con tus alertas.</p>
        ) : (
          <ol className="flex flex-col gap-1 text-sm">
            {matches.map((m) => (
              <li key={m.tender.id} className="flex items-center gap-2">
                <Link href={`/tenders/${m.tender.id}`} className="grow truncate hover:text-brand">
                  {m.tender.title}
                </Link>
                <span className="shrink-0 text-xs text-neutral-500">{m.tender.source}</span>
                <span className="shrink-0 text-xs text-brand">{m.alerts.join(", ")}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
