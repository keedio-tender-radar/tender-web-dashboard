"use client";

import { useCallback, useEffect, useState } from "react";

import { api, type TenderWithScore } from "@/lib/api";
import { TenderCard } from "@/components/TenderCard";

const PAGE_SIZE = 8;

export default function TendersPage() {
  const [tenders, setTenders] = useState<TenderWithScore[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState(""); // término aplicado (debounced)
  const [order, setOrder] = useState("recent");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // debounce de la búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // resetea la página al cambiar filtro de estado u orden
  useEffect(() => setPage(0), [status, order]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // pedimos PAGE_SIZE+1 para saber si hay página siguiente
    api
      .searchWithScores({
        status: status || undefined,
        q: q || undefined,
        order,
        limit: PAGE_SIZE + 1,
        offset: page * PAGE_SIZE,
      })
      .then(setTenders)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [status, q, order, page]);

  useEffect(load, [load]);

  const hasNext = tenders.length > PAGE_SIZE;
  const visible = tenders.slice(0, PAGE_SIZE);

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Licitaciones</h1>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título…"
          className="grow rounded-lg border border-neutral-700 bg-[#141a2e] px-3 py-1.5 text-sm"
        />
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
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="rounded-lg border border-neutral-700 bg-[#141a2e] px-3 py-1.5 text-sm"
        >
          <option value="recent">Más recientes</option>
          <option value="score">Mejor score</option>
        </select>
        <a
          href={api.exportCsvUrl({ status: status || undefined, q: q || undefined })}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-brand"
        >
          ⬇ CSV
        </a>
      </div>

      {error && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}

      {!loading && visible.length === 0 ? (
        <p className="text-neutral-500">No hay licitaciones para este filtro.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((it) => (
            <TenderCard key={it.tender.id} item={it} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0 || loading}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 disabled:opacity-40"
        >
          ← Anterior
        </button>
        <span className="text-neutral-500">Página {page + 1}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNext || loading}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>
    </section>
  );
}
