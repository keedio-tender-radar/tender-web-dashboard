"use client";

import { useEffect, useState } from "react";

import { api, type Tender } from "@/lib/api";
import { TenderCard } from "@/components/TenderCard";

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listTenders(status || undefined)
      .then(setTenders)
      .catch((e) => setError(String(e)));
  }, [status]);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Licitaciones</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-neutral-700 bg-[#141a2e] px-3 py-1.5 text-sm"
        >
          <option value="">Todas</option>
          <option value="discovered">Descubiertas</option>
          <option value="scored">Puntuadas</option>
          <option value="interested">Interesa</option>
          <option value="discarded">Descartadas</option>
          <option value="partner">Partner</option>
        </select>
      </div>

      {error && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}

      {tenders.length === 0 ? (
        <p className="text-neutral-500">No hay licitaciones para este filtro.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {tenders.map((t) => (
            <TenderCard key={t.id} item={{ tender: t, score: null }} />
          ))}
        </div>
      )}
    </section>
  );
}
