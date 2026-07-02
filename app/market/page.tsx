"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  api,
  type Competitor,
  type MarketBuyer,
  type MarketCpv,
  type MarketOverview,
  type MarketStats,
  type Stats,
} from "@/lib/api";
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
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [awardBuyers, setAwardBuyers] = useState<MarketBuyer[]>([]);
  const [awardCpv, setAwardCpv] = useState<MarketCpv[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch((e) => setError(String(e)));
    api.marketStats().then(setMarket).catch(() => setMarket(null));
    api.marketOverview().then(setOverview).catch(() => setOverview(null));
    api.marketCompetitors(undefined, 8).then((r) => setCompetitors(r.competitors)).catch(() => {});
    api.marketBuyers(8).then((r) => setAwardBuyers(r.buyers)).catch(() => {});
    api.marketCpv(8).then((r) => setAwardCpv(r.divisions)).catch(() => {});
  }, []);

  const pct = (v: number | null) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inteligencia de mercado</h1>
          <p className="text-neutral-400">
            Visión agregada del pipeline de contratación detectado. {stats.scored_count}{" "}
            licitaciones puntuadas · score medio {stats.avg_score}/100.
          </p>
        </div>
        <a
          href={api.marketCsvUrl()}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:border-brand"
        >
          ⬇ CSV
        </a>
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

      {overview && overview.awards > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Adjudicaciones (histórico público)</h2>
              <p className="text-sm text-neutral-400">
                {overview.awards} adjudicaciones · baja media {pct(overview.avg_baja)} ·{" "}
                {overview.total_awarded.toLocaleString("es-ES")} € adjudicados
              </p>
            </div>
            <a
              href={api.marketAwardsCsvUrl()}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:border-brand"
            >
              ⬇ CSV
            </a>
          </div>
          <div className="card overflow-x-auto">
            <h3 className="mb-3 font-semibold">Competidores frecuentes</h3>
            {competitors.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Sin datos de adjudicatarios todavía (ejecuta la ingesta de adjudicaciones).
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-neutral-400">
                  <tr>
                    <th className="pb-2">Adjudicatario</th>
                    <th className="pb-2 text-right">Contratos</th>
                    <th className="pb-2 text-right">Importe</th>
                    <th className="pb-2 text-right">Cuota</th>
                    <th className="pb-2 text-right">Baja media</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((c) => (
                    <tr key={c.supplier} className="border-t border-[var(--border)]">
                      <td className="py-1.5">
                        <Link
                          href={`/market/competitor?name=${encodeURIComponent(c.supplier)}`}
                          className="hover:text-brand hover:underline"
                        >
                          {c.supplier}
                        </Link>
                      </td>
                      <td className="py-1.5 text-right font-medium">{c.wins}</td>
                      <td className="py-1.5 text-right text-neutral-400">
                        {c.total_awarded.toLocaleString("es-ES")} €
                      </td>
                      <td className="py-1.5 text-right">{pct(c.share ?? null)}</td>
                      <td className="py-1.5 text-right">{pct(c.avg_baja)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {awardBuyers.length > 0 && (
              <BarList
                title="Compradores recurrentes (adjudicaciones)"
                data={Object.fromEntries(awardBuyers.map((b) => [b.buyer.slice(0, 40), b.awards]))}
                color="bg-sky-500"
              />
            )}
            {awardCpv.length > 0 && (
              <BarList
                title="CPV estratégicos (por adjudicaciones)"
                data={Object.fromEntries(
                  awardCpv.map((c) => [
                    cpvLabel(c.cpv_division).split(" · ").slice(1).join(" · ") || c.cpv_division,
                    c.awards,
                  ]),
                )}
                color="bg-violet-500"
              />
            )}
          </div>
          <p className="text-xs text-neutral-500">
            Fuente: formalizaciones públicas de TED. La <strong>baja</strong> se calcula sobre el
            presupuesto base estimado del procedimiento (solo cuando consta en la nota); el{" "}
            <strong>adjudicatario</strong> es la empresa licitadora ganadora (en contratos marco se
            muestra la primera). Analítica orientativa sobre datos abiertos.
          </p>
        </div>
      )}
    </section>
  );
}
