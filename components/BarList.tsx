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
    <div className="card">
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
              <div className="h-2.5 grow overflow-hidden rounded-full bg-[#0b1020]">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{
                    width: `${value > 0 ? Math.max(3, Math.round((value / max) * 100)) : 0}%`,
                  }}
                />
              </div>
              <span className="tnum w-10 shrink-0 text-right font-medium text-neutral-200">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
