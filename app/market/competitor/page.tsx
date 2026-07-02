"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { api, type CompetitorProfile } from "@/lib/api";
import { BarList } from "@/components/BarList";
import { cpvLabel } from "@/lib/cpv";

const pct = (v: number | null) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);
const eur = (v: number | null) => (v == null ? "—" : `${v.toLocaleString("es-ES")} €`);

function CompetitorProfileView() {
  const params = useSearchParams();
  const name = params.get("name") ?? "";
  const [profile, setProfile] = useState<CompetitorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    setProfile(null);
    setError(null);
    api
      .competitorProfile(name)
      .then(setProfile)
      .catch(() => setError("No hay adjudicaciones para este adjudicatario."));
  }, [name]);

  return (
    <section className="flex flex-col gap-5">
      <Link href="/market" className="text-sm text-brand hover:underline">
        ← Volver a Mercado
      </Link>
      <h1 className="text-2xl font-bold">{profile?.supplier ?? name}</h1>

      {error && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}
      {!profile && !error && <p className="text-neutral-400">Cargando…</p>}

      {profile && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["Contratos", String(profile.wins)],
              ["Importe total", eur(profile.total_awarded)],
              ["Cuota de mercado", pct(profile.share)],
              ["Baja media", pct(profile.avg_baja)],
            ].map(([label, value]) => (
              <div key={label} className="card">
                <p className="text-xs text-neutral-400">{label}</p>
                <p className="tnum text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {profile.by_buyer.length > 0 && (
              <BarList
                title="Órganos de los que gana"
                data={Object.fromEntries(profile.by_buyer.map((b) => [b.buyer.slice(0, 40), b.awards]))}
                color="bg-sky-500"
              />
            )}
            {profile.by_cpv.length > 0 && (
              <BarList
                title="CPV en los que gana"
                data={Object.fromEntries(
                  profile.by_cpv.map((c) => [
                    cpvLabel(c.cpv_division).split(" · ").slice(1).join(" · ") || c.cpv_division,
                    c.awards,
                  ]),
                )}
                color="bg-violet-500"
              />
            )}
          </div>

          <div className="card overflow-x-auto">
            <h2 className="mb-3 font-semibold">Contratos adjudicados</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-neutral-400">
                <tr>
                  <th className="pb-2">Objeto</th>
                  <th className="pb-2">Órgano</th>
                  <th className="pb-2 text-right">Adjudicado</th>
                  <th className="pb-2 text-right">Baja</th>
                  <th className="pb-2 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {profile.contracts.map((c, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-1.5">
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noreferrer" className="hover:text-brand">
                          {(c.title ?? "—").slice(0, 55)}
                        </a>
                      ) : (
                        (c.title ?? "—").slice(0, 55)
                      )}
                    </td>
                    <td className="py-1.5 text-neutral-400">{(c.buyer ?? "—").slice(0, 35)}</td>
                    <td className="py-1.5 text-right">{eur(c.awarded_amount)}</td>
                    <td className="py-1.5 text-right">{pct(c.baja)}</td>
                    <td className="py-1.5 text-right text-neutral-500">{c.award_date ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default function CompetitorPage() {
  return (
    <Suspense fallback={<p className="text-neutral-400">Cargando…</p>}>
      <CompetitorProfileView />
    </Suspense>
  );
}
