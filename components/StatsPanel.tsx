import type { Stats } from "@/lib/api";

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
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
        <Kpi label="Oportunidades GO" value={String(stats.go_count)} />
        <Kpi label="Presupuesto GO" value={money(stats.go_budget_total)} />
        <Kpi
          label="GO / Revisar / No-Go"
          value={`${rec.go ?? 0} / ${rec.revisar ?? 0} / ${rec.no_go ?? 0}`}
        />
      </div>
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
          <span className="uppercase tracking-wide text-neutral-400">Por fuente:</span>
          {sources.map(([src, n]) => (
            <span key={src} className="rounded-full bg-[#141a2e] px-2 py-0.5">
              {src} · {n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
