"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { CalendarPlus, Sparkles } from "lucide-react";

import { api, type DailySnapshot, type Stats } from "@/lib/api";
import { SemaphoreDot } from "@/components/SemaphoreDot";
import { SkeletonStats } from "@/components/Skeleton";

const PIPELINE = [
  ["06:00", "Ingesta (PLACSP + TED + portales extra)"],
  ["06:30", "Scoring Go/No-Go"],
  ["06:45", "Alertas de oportunidades GO"],
  ["07:00", "Re-análisis con el pliego"],
  ["07:30", "Radar diario → Telegram"],
  ["08:00", "Recordatorios de cierre → Telegram"],
];

const WEEKLY = [
  ["Lun 05:00", "Adjudicaciones (inteligencia de mercado)"],
  ["Lun 07:00", "Informe por email → dirección"],
  ["Lun 08:00", "Informe de mercado → Telegram"],
];

function ago(iso: string | null): string {
  if (!iso) return "nunca";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

function freshnessLight(iso: string | null): string {
  if (!iso) return "red";
  const h = (Date.now() - new Date(iso).getTime()) / 3600000;
  return h <= 26 ? "green" : h <= 50 ? "yellow" : "red";
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="tnum mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

type Svc = Awaited<ReturnType<typeof api.servicesStatus>>;
type Runs = Awaited<ReturnType<typeof api.runsSummary>>["jobs"];

function okLight(ok: boolean | null): string {
  return ok === null ? "gray" : ok ? "green" : "red";
}

export default function StatusPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);
  const [history, setHistory] = useState<{ date: string; count: number; items: { tender_id: string }[] }[]>([]);
  const [services, setServices] = useState<Svc | null>(null);
  const [runs, setRuns] = useState<Runs>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch((e) => setError(String(e)));
    api.dailySnapshot().then(setSnapshot).catch(() => setSnapshot(null));
    api.dailySnapshots(14).then(setHistory).catch(() => setHistory([]));
    api.servicesStatus().then(setServices).catch(() => setServices(null));
    api.runsSummary().then((r) => setRuns(r.jobs)).catch(() => setRuns([]));
  }, []);

  // Novedades: tenders en la foto de hoy que no estaban en la anterior.
  const newToday =
    history.length >= 2
      ? history[0].items.filter(
          (i) => !history[1].items.some((j) => j.tender_id === i.tender_id),
        ).length
      : 0;

  if (error) return <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>;
  if (!stats)
    return (
      <section className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold">Estado del sistema</h1>
        <SkeletonStats />
      </section>
    );

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Estado del sistema</h1>
        <a
          href={api.calendarIcsUrl()}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:border-brand"
          title="Suscribe los cierres de licitación a tu Google/Outlook Calendar"
        >
          <CalendarPlus className="h-4 w-4" /> Suscribir calendario (.ics)
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Licitaciones" value={stats.total} />
        <Card label="Puntuadas" value={stats.scored_count} />
        <Card label="GO" value={stats.go_count} />
        <Card label="Score medio" value={stats.avg_score} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 font-semibold">Frescura del pipeline</h2>
          <p className="flex items-center gap-2 text-sm text-neutral-300">
            <SemaphoreDot light={freshnessLight(stats.last_ingested_at)} />
            <span>
              Última ingesta:{" "}
              <span className="text-neutral-100">{ago(stats.last_ingested_at)}</span>
            </span>
          </p>
          <p className="flex items-center gap-2 text-sm text-neutral-300">
            <SemaphoreDot light={freshnessLight(stats.last_scored_at)} />
            <span>
              Último scoring: <span className="text-neutral-100">{ago(stats.last_scored_at)}</span>
            </span>
          </p>
          <p className="mt-2 text-sm text-neutral-400">
            Presupuesto total en oportunidades GO:{" "}
            <span className="tnum text-neutral-100">
              {stats.go_budget_total.toLocaleString("es-ES")} EUR
            </span>
          </p>
        </div>

        <div className="card">
          <h2 className="mb-2 font-semibold">Por fuente</h2>
          {Object.entries(stats.by_source).map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-neutral-400">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 font-semibold">Servicios e IA</h2>
          {services ? (
            <div className="flex flex-col gap-1.5 text-sm text-neutral-300">
              <span className="flex items-center gap-2">
                <SemaphoreDot light={okLight(services.doc_service)} /> Extracción de pliegos
                (doc-service)
              </span>
              <span className="flex items-center gap-2">
                <SemaphoreDot light={okLight(services.analysis_service)} /> Servicio de análisis
              </span>
              <span className="flex items-center gap-2">
                <SemaphoreDot light={okLight(services.visual_rag)} /> Visual RAG (pregúntale al
                pliego)
              </span>
              <span className="flex items-center gap-2">
                <SemaphoreDot light={okLight(services.llm)} />
                <span>
                  LLM real (OpenRouter)
                  {services.llm_models?.length ? (
                    <span className="text-neutral-500"> · {services.llm_models.length} modelos</span>
                  ) : services.llm === false ? (
                    <span className="text-neutral-500"> · rule-based</span>
                  ) : null}
                </span>
              </span>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No disponible.</p>
          )}
        </div>

        <div className="card">
          <h2 className="mb-2 font-semibold">Últimas ejecuciones</h2>
          {runs.length === 0 ? (
            <p className="text-sm text-neutral-500">Sin registros de ejecución todavía.</p>
          ) : (
            <div className="flex flex-col gap-1 text-sm">
              {runs.map((r) => (
                <div key={r.job} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-neutral-300">
                    <SemaphoreDot light={r.status === "ok" ? "green" : "red"} />
                    <span>
                      {r.job}
                      {r.count != null ? (
                        <span className="text-neutral-500"> · {r.count}</span>
                      ) : null}
                    </span>
                  </span>
                  <span className="shrink-0 text-neutral-500">{ago(r.at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-2 font-semibold">Pipeline diario (cron)</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {PIPELINE.map(([t, d]) => (
            <li key={t} className="flex gap-3">
              <span className="tnum w-14 shrink-0 font-mono text-neutral-400">{t}</span>
              <span className="text-neutral-300">{d}</span>
            </li>
          ))}
        </ul>
        <h3 className="mb-2 mt-4 text-sm font-semibold text-neutral-300">Semanales</h3>
        <ul className="flex flex-col gap-1 text-sm">
          {WEEKLY.map(([t, d]) => (
            <li key={t} className="flex gap-3">
              <span className="w-20 shrink-0 font-mono text-neutral-400">{t}</span>
              <span className="text-neutral-300">{d}</span>
            </li>
          ))}
        </ul>
      </div>

      {snapshot && snapshot.date && (
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">
              Foto diaria #{snapshot.number}{" "}
              <span className="text-sm font-normal text-neutral-500">
                · {snapshot.date} · {snapshot.count} activas
              </span>
            </h2>
          </div>
          <ol className="flex flex-col gap-1 text-sm">
            {snapshot.items.slice(0, 10).map((it, i) => (
              <li key={it.tender_id} className="flex items-center gap-2">
                <span className="tnum w-5 shrink-0 text-neutral-500">{i + 1}.</span>
                <SemaphoreDot light={it.traffic_light} />
                <Link href={`/tenders/${it.tender_id}`} className="grow truncate hover:text-brand">
                  {it.title}
                </Link>
                <span className="shrink-0 text-neutral-400">
                  {it.source} · {it.score}
                  {it.days_remaining != null ? ` · ${it.days_remaining}d` : ""}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-neutral-500">
            Misma foto que reciben Telegram y la web cada día.
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div className="card">
          <h2 className="mb-2 font-semibold">
            Histórico de fotos{" "}
            {newToday > 0 && (
              <span className="inline-flex items-center gap-1 text-sm font-normal text-emerald-400">
                · <Sparkles className="h-3.5 w-3.5" /> {newToday} nuevas hoy
              </span>
            )}
          </h2>
          <div className="flex flex-col gap-1 text-sm">
            {history.map((h) => (
              <div key={h.date} className="flex items-center gap-3">
                <span className="w-24 shrink-0 font-mono text-neutral-400">{h.date}</span>
                <span className="h-2 grow overflow-hidden rounded-full bg-[#0b1020]">
                  <span
                    className="block h-full rounded-full bg-brand"
                    style={{
                      width: `${Math.min(100, (h.count / Math.max(...history.map((x) => x.count), 1)) * 100)}%`,
                    }}
                  />
                </span>
                <span className="w-8 text-right tabular-nums text-neutral-300">{h.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
