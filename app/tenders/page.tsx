"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Download } from "lucide-react";

import { api, type TenderWithScore } from "@/lib/api";
import { TenderCard } from "@/components/TenderCard";
import { SkeletonGrid } from "@/components/Skeleton";
import { toast } from "@/components/Toaster";

const PAGE_SIZE = 8;

export default function TendersPage() {
  const [tenders, setTenders] = useState<TenderWithScore[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState(""); // término aplicado (debounced)
  const [order, setOrder] = useState("recent");
  const [light, setLight] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxDays, setMaxDays] = useState("");
  const [cpv, setCpv] = useState("");
  const [source, setSource] = useState("");
  const [bodySearch, setBodySearch] = useState("");
  const [body, setBody] = useState(""); // órgano aplicado (debounced)
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Atajo "/" para enfocar la búsqueda (si no se está escribiendo en otro campo).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Hidrata los filtros desde la URL al montar (vistas compartibles/recargables).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("status")) setStatus(p.get("status")!);
    if (p.get("q")) setSearch(p.get("q")!);
    if (p.get("order")) setOrder(p.get("order")!);
    if (p.get("light")) setLight(p.get("light")!);
    if (p.get("min_score")) setMinScore(p.get("min_score")!);
    if (p.get("max_days")) setMaxDays(p.get("max_days")!);
    if (p.get("cpv")) setCpv(p.get("cpv")!);
    if (p.get("source")) setSource(p.get("source")!);
    if (p.get("body")) setBodySearch(p.get("body")!);
  }, []);

  // Refleja los filtros aplicados en la URL (sin recargar).
  useEffect(() => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (q) p.set("q", q);
    if (order !== "recent") p.set("order", order);
    if (light) p.set("light", light);
    if (minScore) p.set("min_score", minScore);
    if (maxDays) p.set("max_days", maxDays);
    if (cpv) p.set("cpv", cpv);
    if (source) p.set("source", source);
    if (body) p.set("body", body);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [status, q, order, light, minScore, maxDays, cpv, source, body]);

  // debounce de la búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // debounce del órgano
  useEffect(() => {
    const t = setTimeout(() => setBody(bodySearch.trim()), 350);
    return () => clearTimeout(t);
  }, [bodySearch]);

  // resetea la página al cambiar filtros u orden
  useEffect(() => setPage(0), [status, order, light, minScore, maxDays, cpv, source, body]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // pedimos PAGE_SIZE+1 para saber si hay página siguiente
    api
      .searchWithScores({
        status: status || undefined,
        q: q || undefined,
        order,
        traffic_light: light || undefined,
        min_score: minScore ? Number(minScore) : undefined,
        max_days_remaining: maxDays ? Number(maxDays) : undefined,
        cpv: cpv || undefined,
        source: source || undefined,
        contracting_body: body || undefined,
        limit: PAGE_SIZE + 1,
        offset: page * PAGE_SIZE,
      })
      .then(setTenders)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [status, q, order, light, minScore, maxDays, cpv, source, body, page]);

  useEffect(load, [load]);

  const hasNext = tenders.length > PAGE_SIZE;
  const visible = tenders.slice(0, PAGE_SIZE);
  const hasFilters = !!(
    status || search || light || minScore || maxDays || cpv || source || bodySearch ||
    order !== "recent"
  );

  function clearFilters() {
    setStatus("");
    setSearch("");
    setOrder("recent");
    setLight("");
    setMinScore("");
    setMaxDays("");
    setCpv("");
    setSource("");
    setBodySearch("");
  }

  function copyLink() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast("Enlace de la vista copiado"))
      .catch(() => toast("No se pudo copiar", "error"));
  }

  async function triage(tid: string, action: string) {
    try {
      await api.postAction(tid, action);
      toast(action === "interested" ? "Marcada: Interesa ✅" : "Descartada ❌");
      load();
    } catch (e) {
      toast(String(e), "error");
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Licitaciones</h1>
        <div className="flex items-center gap-2 text-sm">
          {hasFilters && (
            <button onClick={clearFilters} className="text-neutral-400 hover:text-white">
              Limpiar filtros
            </button>
          )}
          <button
            onClick={copyLink}
            className="rounded-lg border border-[var(--border)] px-2.5 py-1 hover:border-brand"
          >
            🔗 Copiar enlace
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar en título y pliego…  ( / )"
          aria-label="Buscar por título"
          className="w-full rounded-lg border border-neutral-700 bg-[#141a2e] px-3 py-1.5 text-sm sm:w-auto sm:grow"
        />
        <select
          value={status}
          aria-label="Filtrar por estado"
          onChange={(e) => setStatus(e.target.value)}
          className="min-w-[120px] flex-1 rounded-lg border border-neutral-700 bg-[#141a2e] px-3 py-1.5 text-sm sm:flex-none"
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
          aria-label="Ordenar"
          onChange={(e) => setOrder(e.target.value)}
          className="min-w-[120px] flex-1 rounded-lg border border-neutral-700 bg-[#141a2e] px-3 py-1.5 text-sm sm:flex-none"
        >
          <option value="recent">Más recientes</option>
          <option value="score">Mejor score</option>
        </select>
        <select
          value={light}
          aria-label="Filtrar por semáforo"
          onChange={(e) => setLight(e.target.value)}
          className="min-w-[120px] flex-1 rounded-lg border border-neutral-700 bg-[#141a2e] px-3 py-1.5 text-sm sm:flex-none"
        >
          <option value="">Semáforo</option>
          <option value="green">🟢 Prioritaria</option>
          <option value="yellow">🟡 Revisar</option>
          <option value="red">🔴 Descartar</option>
          <option value="gray">⚪ Sin datos</option>
        </select>
        <select
          value={minScore}
          aria-label="Score mínimo"
          onChange={(e) => setMinScore(e.target.value)}
          className="min-w-[120px] flex-1 rounded-lg border border-neutral-700 bg-[#141a2e] px-3 py-1.5 text-sm sm:flex-none"
        >
          <option value="">Score mín.</option>
          <option value="50">≥ 50</option>
          <option value="70">≥ 70</option>
          <option value="85">≥ 85</option>
        </select>
        <select
          value={maxDays}
          aria-label="Cierre en"
          onChange={(e) => setMaxDays(e.target.value)}
          className="min-w-[120px] flex-1 rounded-lg border border-neutral-700 bg-[#141a2e] px-3 py-1.5 text-sm sm:flex-none"
        >
          <option value="">Cierre</option>
          <option value="7">Cierra ≤ 7 d</option>
          <option value="15">Cierra ≤ 15 d</option>
          <option value="30">Cierra ≤ 30 d</option>
        </select>
        <select
          value={cpv}
          aria-label="Categoría CPV"
          onChange={(e) => setCpv(e.target.value)}
          className="min-w-[120px] flex-1 rounded-lg border border-neutral-700 bg-[#141a2e] px-3 py-1.5 text-sm sm:flex-none"
        >
          <option value="">Categoría (CPV)</option>
          <option value="72">72 · Servicios TI</option>
          <option value="48">48 · Software</option>
          <option value="73">73 · I+D</option>
          <option value="71">71 · Ingeniería</option>
          <option value="79">79 · Servicios a empresas</option>
          <option value="80">80 · Formación</option>
        </select>
        <select
          value={source}
          aria-label="Filtrar por fuente"
          onChange={(e) => setSource(e.target.value)}
          className="min-w-[120px] flex-1 rounded-lg border border-neutral-700 bg-[#141a2e] px-3 py-1.5 text-sm sm:flex-none"
        >
          <option value="">Fuente</option>
          <option value="placsp">PLACSP</option>
          <option value="ted">TED</option>
        </select>
        <input
          value={bodySearch}
          onChange={(e) => setBodySearch(e.target.value)}
          placeholder="Órgano…"
          aria-label="Filtrar por órgano de contratación"
          className="min-w-[120px] flex-1 rounded-lg border border-neutral-700 bg-[#141a2e] px-3 py-1.5 text-sm sm:flex-none"
        />
        <a
          href={api.exportCsvUrl({ status: status || undefined, q: q || undefined })}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-brand"
        >
          <Download className="h-4 w-4" /> CSV
        </a>
      </div>

      {error && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}

      {!loading && (
        <p className="text-sm text-neutral-500">
          {visible.length === 0
            ? "Sin resultados"
            : `${visible.length} resultado(s)${hasNext ? "+" : ""} · página ${page + 1}`}
        </p>
      )}

      {loading ? (
        <SkeletonGrid count={PAGE_SIZE} />
      ) : visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-neutral-500">
          No hay licitaciones para este filtro. Prueba a relajar los filtros o la búsqueda.
        </p>
      ) : (
        <div className="grid gap-3 stagger sm:grid-cols-2">
          {visible.map((it) => (
            <TenderCard key={it.tender.id} item={it} onAction={triage} />
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
