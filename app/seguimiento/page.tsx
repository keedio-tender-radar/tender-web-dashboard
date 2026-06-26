"use client";

import { useEffect, useState } from "react";

import { api, type TenderWithScore } from "@/lib/api";
import { TenderCard } from "@/components/TenderCard";

function daysLeft(deadline: string | null): number | null {
  if (!deadline) return null;
  return Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000);
}

const GROUPS: { status: string; label: string }[] = [
  { status: "interested", label: "✅ Interesa" },
  { status: "partner", label: "🤝 Partner" },
];

export default function SeguimientoPage() {
  const [groups, setGroups] = useState<Record<string, TenderWithScore[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all(
      GROUPS.map((g) => api.searchWithScores({ status: g.status, order: "recent", limit: 100 })),
    )
      .then((results) => {
        const byStatus: Record<string, TenderWithScore[]> = {};
        GROUPS.forEach((g, i) => {
          byStatus[g.status] = [...results[i]].sort((a, b) => {
            const da = daysLeft(a.tender.deadline);
            const db = daysLeft(b.tender.deadline);
            if (da === null) return 1;
            if (db === null) return -1;
            return da - db; // cierre más próximo primero
          });
        });
        setGroups(byStatus);
      })
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>;

  const total = Object.values(groups).reduce((n, arr) => n + arr.length, 0);

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Seguimiento</h1>
        <p className="text-neutral-400">
          Licitaciones que estáis persiguiendo, ordenadas por cierre más próximo.
        </p>
      </div>

      {total === 0 && (
        <p className="text-neutral-500">
          Aún no hay licitaciones en seguimiento. Marca alguna como “Interesa” o “Partner” en su
          ficha.
        </p>
      )}

      {GROUPS.map((g) => {
        const items = groups[g.status] || [];
        if (items.length === 0) return null;
        return (
          <div key={g.status} className="flex flex-col gap-3">
            <h2 className="font-semibold">
              {g.label} <span className="text-neutral-500">({items.length})</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((it) => {
                const d = daysLeft(it.tender.deadline);
                const urgent = d !== null && d <= 7;
                return (
                  <div key={it.tender.id} className="relative">
                    {d !== null && (
                      <span
                        className={`absolute right-2 top-2 z-10 rounded px-1.5 py-0.5 text-[11px] ${
                          urgent ? "bg-red-900 text-red-100" : "bg-[#0b1020] text-neutral-400"
                        }`}
                      >
                        {d < 0 ? "vencida" : `${d} d`}
                      </span>
                    )}
                    <TenderCard item={it} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
