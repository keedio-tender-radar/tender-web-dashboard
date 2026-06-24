"use client";

import { useEffect, useState } from "react";

import { api, type TenderWithScore } from "@/lib/api";
import { TenderCard } from "@/components/TenderCard";

export default function RadarPage() {
  const [top, setTop] = useState<TenderWithScore[]>([]);
  const [urgent, setUrgent] = useState<TenderWithScore[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.top(10), api.urgent(7)])
      .then(([t, u]) => {
        setTop(t);
        setUrgent(u);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Radar diario</h1>
        <p className="text-neutral-400">Oportunidades priorizadas por encaje con Keedio.</p>
      </div>

      {loading && <p className="text-neutral-500">Cargando…</p>}
      {error && (
        <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">
          No se pudo conectar con la API ({api.apiUrl}). {error}
        </p>
      )}

      {urgent.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">🚨 Urgentes (cierre próximo)</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {urgent.map((it) => (
              <TenderCard key={it.tender.id} item={it} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">⭐ Top oportunidades</h2>
        {!loading && top.length === 0 ? (
          <p className="text-neutral-500">
            Aún no hay licitaciones puntuadas. Ejecuta la ingesta y el análisis para poblar el radar.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {top.map((it) => (
              <TenderCard key={it.tender.id} item={it} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
