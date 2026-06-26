"use client";

import { useEffect, useState } from "react";

import { api, type MarketStats, type Stats } from "@/lib/api";
import { AreaChart } from "@/components/AreaChart";
import { BarList } from "@/components/BarList";
import { SkeletonStats } from "@/components/Skeleton";
import { cpvLabel } from "@/lib/cpv";

const REC_LABELS: Record<string, string> = {
  go: "GO",
  revisar: "Revisar",
  partner: "Partner",
  no_go: "No-Go",
};

function relabel(data: Record<string, number>, fn: (k: string) => string) {
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [fn(k), v]));
}

export default function MarketPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [market, setMarket] = useState<MarketStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch((e) => setError(String(e)));
    api.marketStats().then(setMarket).catch(() => setMarket(null));
  }, []);

  if (error) return <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>;
  if (!stats)
    return (
      <section className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold">Inteligencia de mercado</h1>
        <SkeletonStats count={4} />
      </section>
    );

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Inteligencia de mercado</h1>
        <p className="text-neutral-400">
          Visión agregada del pipeline de contratación detectado. {stats.scored_count} licitaciones
          puntuadas · score medio {stats.avg_score}/100.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BarList title="Recomendación" data={relabel(stats.by_recommendation, (k) => REC_LABELS[k] ?? k)} />
        <BarList title="Por fuente" data={stats.by_source} color="bg-emerald-500" />
        {market && Object.keys(market.top_buyers).length > 0 && (
          <BarList title="Top órganos de contratación" data={market.top_buyers} color="bg-sky-500" />
        )}
        {market && Object.keys(market.by_month).length > 0 && (
          <AreaChart title="Volumen por mes" data={market.by_month} />
        )}
        <BarList
          title="Top CPV"
          data={relabel(stats.by_cpv, (k) => cpvLabel(k).split(" · ").slice(1).join(" · ") || k)}
          color="bg-violet-500"
        />
        {market && Object.keys(market.avg_budget_by_source).length > 0 && (
          <div className="card">
            <h2 className="mb-2 font-semibold">Presupuesto medio por fuente</h2>
            {Object.entries(market.avg_budget_by_source).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="uppercase text-neutral-400">{k}</span>
                <span className="font-medium">{v.toLocaleString("es-ES")} €</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
