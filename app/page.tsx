"use client";

import { useEffect, useState } from "react";

import { Siren, Star } from "lucide-react";

import { api, type DailySnapshot, type Stats, type TenderWithScore } from "@/lib/api";
import { StatsPanel } from "@/components/StatsPanel";
import { TenderCard } from "@/components/TenderCard";
import { SkeletonGrid, SkeletonStats } from "@/components/Skeleton";
import { SemaphoreLegend } from "@/components/SemaphoreLegend";

function money(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toLocaleString("es-ES", { maximumFractionDigits: 1 })} M€`;
  return `${n.toLocaleString("es-ES")} €`;
}

export default function RadarPage() {
  const [top, setTop] = useState<TenderWithScore[]>([]);
  const [urgent, setUrgent] = useState<TenderWithScore[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.top(10), api.urgent(7), api.stats()])
      .then(([t, u, s]) => {
        setTop(t);
        setUrgent(u);
        setStats(s);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
    api.dailySnapshot().then(setSnapshot).catch(() => setSnapshot(null));
  }, []);

  return (
    <section className="flex flex-col gap-8 stagger">
      <header className="fade-up">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Radar diario</h1>
        {stats ? (
          <p className="mt-2 text-lg leading-snug text-neutral-300 sm:text-xl">
            Hoy hay <span className="tnum font-bold text-emerald-400">{stats.go_count}</span>{" "}
            {stats.go_count === 1 ? "oportunidad" : "oportunidades"}{" "}
            <span className="font-semibold text-emerald-400">GO</span>
            {stats.go_budget_total > 0 && (
              <>
                {" · "}
                <span className="tnum font-semibold text-neutral-100">
                  {money(stats.go_budget_total)}
                </span>{" "}
                en juego
              </>
            )}
            {urgent.length > 0 && (
              <>
                {" · "}
                <span className="tnum font-semibold text-amber-400">{urgent.length}</span> con cierre
                próximo
              </>
            )}
          </p>
        ) : (
          <p className="mt-2 text-neutral-400">
            Oportunidades priorizadas por encaje con Keedio.
          </p>
        )}
        {snapshot?.date && (
          <p className="mt-2 text-xs text-neutral-500">
            Foto diaria #{snapshot.number} · {snapshot.date} · {snapshot.count} activas
          </p>
        )}
        <div className="mt-3">
          <SemaphoreLegend />
        </div>
      </header>

      {error && (
        <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">
          No se pudo conectar con la API ({api.apiUrl}). {error}
        </p>
      )}

      {loading ? (
        <>
          <SkeletonStats />
          <SkeletonGrid count={4} />
        </>
      ) : (
        <>
          {stats && <StatsPanel stats={stats} />}

          {urgent.length > 0 && (
            <div className="fade-up">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Siren className="h-5 w-5 text-rose-400" /> Urgentes (cierre próximo)
              </h2>
              <div className="grid gap-3 stagger sm:grid-cols-2">
                {urgent.map((it) => (
                  <TenderCard key={it.tender.id} item={it} />
                ))}
              </div>
            </div>
          )}

          <div className="fade-up">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Star className="h-5 w-5 text-amber-400" /> Top oportunidades
            </h2>
            {top.length === 0 ? (
              <p className="text-neutral-500">
                Aún no hay licitaciones puntuadas. Ejecuta la ingesta y el análisis para poblar el
                radar.
              </p>
            ) : (
              <div className="grid gap-3 stagger sm:grid-cols-2">
                {top.map((it) => (
                  <TenderCard key={it.tender.id} item={it} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
