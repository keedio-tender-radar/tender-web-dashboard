// Lista de barras horizontales simple (sin librería de gráficos).

type Entry = [string, number];

export function BarList({
  title,
  data,
  color = "bg-brand",
}: {
  title: string;
  data: Record<string, number>;
  color?: string;
}) {
  const entries: Entry[] = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = entries.reduce((m, [, v]) => Math.max(m, v), 0) || 1;

  return (
    <div className="rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-neutral-500">Sin datos.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map(([label, value]) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span className="w-40 shrink-0 truncate text-neutral-300" title={label}>
                {label}
              </span>
              <div className="h-3 grow rounded bg-neutral-800">
                <div
                  className={`h-3 rounded ${color}`}
                  style={{ width: `${Math.round((value / max) * 100)}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
