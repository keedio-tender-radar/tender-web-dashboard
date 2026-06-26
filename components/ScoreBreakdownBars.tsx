// Visualización del desglose Go/No-Go: una barra por dimensión (valor / tope).

const DIMS: [string, string, number][] = [
  ["technical_fit", "Encaje técnico", 30],
  ["budget_fit", "Presupuesto", 15],
  ["technical_solvency", "Solvencia técnica", 15],
  ["economic_solvency", "Solvencia económica", 10],
  ["deadline", "Plazo", 15],
  ["partner_need", "Necesidad de partner", 5],
  ["documental_complexity", "Complejidad documental", 4],
  ["contractual_risk", "Riesgo contractual", 5],
  ["incompatibility_risk", "Incompatibilidad", 5],
];

function barColor(ratio: number): string {
  if (ratio >= 0.7) return "bg-emerald-500";
  if (ratio >= 0.4) return "bg-amber-500";
  return "bg-rose-500";
}

export function ScoreBreakdownBars({ breakdown }: { breakdown: Record<string, number> }) {
  return (
    <div className="flex flex-col gap-2">
      {DIMS.map(([key, label, max]) => {
        const value = breakdown[key] ?? 0;
        const ratio = max ? Math.min(1, value / max) : 0;
        return (
          <div key={key} className="grid grid-cols-[170px_1fr_auto] items-center gap-3 text-sm">
            <span className="truncate text-neutral-400">{label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-[#0b1020]">
              <span
                className={`block h-full rounded-full ${barColor(ratio)}`}
                style={{ width: `${ratio * 100}%` }}
              />
            </span>
            <span className="w-12 text-right tabular-nums text-neutral-300">
              {value}
              <span className="text-neutral-600">/{max}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
