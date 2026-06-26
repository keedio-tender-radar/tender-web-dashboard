"use client";

import { useEffect, useState } from "react";

import { api, type DailySnapshot, type Stats, type TenderWithScore } from "@/lib/api";
import { StatsPanel } from "@/components/StatsPanel";
import { TenderCard } from "@/components/TenderCard";
import { SkeletonGrid, SkeletonStats } from "@/components/Skeleton";

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
      <div>
        <h1 className="text-2xl font-bold">Radar diario</h1>
        <p className="text-neutral-400">Oportunidades priorizadas por encaje con Keedio.</p>
        {snapshot?.date && (
          <p className="mt-1 text-xs text-neutral-500">
            Foto diaria #{snapshot.number} · {snapshot.date} · {snapshot.count} activas
          </p>
        )}
      </div>

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
              <h2 className="mb-3 text-lg font-semibold">🚨 Urgentes (cierre próximo)</h2>
              <div className="grid gap-3 stagger sm:grid-cols-2">
                {urgent.map((it) => (
                  <TenderCard key={it.tender.id} item={it} />
                ))}
              </div>
            </div>
          )}

          <div className="fade-up">
            <h2 className="mb-3 text-lg font-semibold">⭐ Top oportunidades</h2>
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
