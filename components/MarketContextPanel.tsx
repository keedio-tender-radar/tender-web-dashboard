"use client";

import { useEffect, useState } from "react";

import { api, type MarketContext } from "@/lib/api";

/** Contexto competitivo del expediente: quién suele ganar su categoría CPV y baja esperada. */
export function MarketContextPanel({ tenderId }: { tenderId: string }) {
  const [ctx, setCtx] = useState<MarketContext | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .tenderMarketContext(tenderId)
      .then(setCtx)
      .catch(() => setCtx(null))
      .finally(() => setLoaded(true));
  }, [tenderId]);

  // Sin muestra por CPV y sin incumbente del órgano → no mostramos ruido.
  if (!loaded || !ctx || (ctx.sample_size === 0 && !ctx.incumbent)) return null;

  const pct = (v: number | null) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);
  const eur = (v: number | null) => (v == null ? "—" : `${v.toLocaleString("es-ES")} €`);

  return (
    <div className="card flex flex-col gap-2">
      <h2 className="font-semibold">Contexto de mercado</h2>
      {ctx.incumbent?.supplier && (
        <p className="text-sm">
          🏛️ Incumbente (último contrato de este órgano):{" "}
          <span className="font-semibold text-neutral-100">{ctx.incumbent.supplier}</span>
          {ctx.incumbent.award_date ? ` · ${ctx.incumbent.award_date}` : ""}
          {ctx.incumbent.awarded_amount != null ? ` · ${eur(ctx.incumbent.awarded_amount)}` : ""}
          {ctx.incumbent.buyer_awards > 1 ? ` · ${ctx.incumbent.buyer_awards} contratos del órgano` : ""}
        </p>
      )}
      {ctx.sample_size > 0 && (
        <p className="text-sm text-neutral-400">
          Basado en {ctx.sample_size} adjudicaciones de la categoría CPV {ctx.cpv_division}.
        </p>
      )}
      {ctx.sample_size > 0 && (
        <div className="flex flex-wrap gap-4 text-sm">
          <span>
            Baja esperada:{" "}
            <span className="font-semibold text-brand">{pct(ctx.expected_baja)}</span>
          </span>
          {ctx.avg_awarded != null && (
            <span className="text-neutral-400">
              Importe medio adjudicado: {ctx.avg_awarded.toLocaleString("es-ES")} €
            </span>
          )}
          {ctx.concentration?.label && (
            <span className="text-neutral-400">
              Mercado:{" "}
              <span className="font-medium text-neutral-200">{ctx.concentration.label}</span> (
              {ctx.concentration.competitors} competidores)
            </span>
          )}
        </div>
      )}
      {ctx.likely_winners.length > 0 && (
        <div>
          <p className="mb-1 text-sm text-neutral-300">Quién suele ganar esto:</p>
          <ul className="flex flex-col gap-1 text-sm">
            {ctx.likely_winners.map((w) => (
              <li key={w.supplier} className="flex justify-between">
                <span>{w.supplier}</span>
                <span className="text-neutral-400">
                  {w.wins} contrato(s) · baja {pct(w.avg_baja)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
