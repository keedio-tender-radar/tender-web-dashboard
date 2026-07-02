import type { Stats } from "@/lib/api";

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card">
      <div className={`tnum text-2xl font-bold ${accent ? "text-emerald-400" : "text-neutral-100"}`}>
        {value}
      </div>
      <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
    </div>
  );
}

/** Distribución de la cartera por recomendación, como barra apilada proporcional + leyenda. */
function RecDistribution({ go, revisar, no_go }: { go: number; revisar: number; no_go: number }) {
  const total = go + revisar + no_go || 1;
  const seg = (n: number, cls: string) =>
    n > 0 ? <span className={cls} style={{ width: `${(n / total) * 100}%` }} /> : null;
  const dot = (color: string, label: string, n: number) => (
    <span className="tnum flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label} {n}
    </span>
  );
  return (
    <div className="card flex flex-col justify-between gap-2">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-[#0b1020]">
        {seg(go, "bg-emerald-500")}
        {seg(revisar, "bg-amber-500")}
        {seg(no_go, "bg-rose-500")}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-400">
        {dot("bg-emerald-500", "GO", go)}
        {dot("bg-amber-500", "Rev.", revisar)}
        {dot("bg-rose-500", "No-Go", no_go)}
      </div>
    </div>
  );
}

function money(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("es-ES", { maximumFractionDigits: 1 })} M€`;
  return `${n.toLocaleString("es-ES")} €`;
}

export function StatsPanel({ stats }: { stats: Stats }) {
  const rec = stats.by_recommendation;
  const sources = Object.entries(stats.by_source).sort((a, b) => b[1] - a[1]);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Licitaciones" value={String(stats.total)} />
        <Kpi label="Oportunidades GO" value={String(stats.go_count)} accent />
        <Kpi label="Presupuesto GO" value={money(stats.go_budget_total)} />
        <RecDistribution go={rec.go ?? 0} revisar={rec.revisar ?? 0} no_go={rec.no_go ?? 0} />
      </div>
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
          <span className="uppercase tracking-wide text-neutral-400">Por fuente:</span>
          {sources.map(([src, n]) => (
            <span key={src} className="tnum rounded-full bg-[#141a2e] px-2 py-0.5">
              {src} · {n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
