"use client";

import { useEffect, useState } from "react";

import { api, type Stats } from "@/lib/api";
import { BarList } from "@/components/BarList";

const REC_LABELS: Record<string, string> = {
  go: "GO",
  revisar: "Revisar",
  partner: "Partner",
  no_go: "No-Go",
};

function relabel(data: Record<string, number>, labels: Record<string, string>) {
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [labels[k] ?? k, v]));
}

export default function MarketPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>;
  if (!stats) return <p className="text-neutral-500">Cargando…</p>;

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
        <BarList title="Recomendación" data={relabel(stats.by_recommendation, REC_LABELS)} />
        <BarList title="Por fuente" data={stats.by_source} color="bg-emerald-500" />
        <BarList title="Por estado" data={stats.by_status} color="bg-amber-500" />
        <BarList title="Top CPV" data={stats.by_cpv} color="bg-violet-500" />
      </div>

      <p className="text-xs text-neutral-500">
        Vista lite (MVP-5 preview). Próximo: competidores, bajas medias por categoría y organismos
        compradores recurrentes a partir del histórico de adjudicaciones.
      </p>
    </section>
  );
}
