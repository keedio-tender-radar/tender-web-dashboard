"use client";

import { useEffect, useState } from "react";

import { api, type Stats } from "@/lib/api";

const PIPELINE = [
  ["06:00", "Ingesta (PLACSP + TED + portales extra)"],
  ["06:30", "Scoring Go/No-Go"],
  ["06:45", "Alertas de oportunidades 🟢 GO"],
  ["07:00", "Re-análisis con el pliego"],
  ["07:30", "Radar diario → Telegram"],
];

function ago(iso: string | null): string {
  if (!iso) return "nunca";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

function freshness(iso: string | null): string {
  if (!iso) return "🔴";
  const h = (Date.now() - new Date(iso).getTime()) / 3600000;
  return h <= 26 ? "🟢" : h <= 50 ? "🟡" : "🔴";
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function StatusPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>;
  if (!stats) return <p className="text-neutral-500">Cargando…</p>;

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Estado del sistema</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Licitaciones" value={stats.total} />
        <Card label="Puntuadas" value={stats.scored_count} />
        <Card label="GO" value={stats.go_count} />
        <Card label="Score medio" value={stats.avg_score} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
          <h2 className="mb-2 font-semibold">Frescura del pipeline</h2>
          <p className="text-sm text-neutral-300">
            {freshness(stats.last_ingested_at)} Última ingesta:{" "}
            <span className="text-neutral-100">{ago(stats.last_ingested_at)}</span>
          </p>
          <p className="text-sm text-neutral-300">
            {freshness(stats.last_scored_at)} Último scoring:{" "}
            <span className="text-neutral-100">{ago(stats.last_scored_at)}</span>
          </p>
          <p className="mt-2 text-sm text-neutral-400">
            Presupuesto total en oportunidades GO:{" "}
            <span className="text-neutral-100">
              {stats.go_budget_total.toLocaleString("es-ES")} EUR
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
          <h2 className="mb-2 font-semibold">Por fuente</h2>
          {Object.entries(stats.by_source).map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-neutral-400">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
        <h2 className="mb-2 font-semibold">Pipeline diario (cron)</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {PIPELINE.map(([t, d]) => (
            <li key={t} className="flex gap-3">
              <span className="w-14 shrink-0 font-mono text-neutral-400">{t}</span>
              <span className="text-neutral-300">{d}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
