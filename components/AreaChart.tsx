// Mini gráfico de área (SVG, sin dependencias) para series temporales pequeñas.

export function AreaChart({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  const values = entries.map(([, v]) => v);
  const max = Math.max(...values, 1);
  const W = 320;
  const H = 90;
  const pad = 6;
  const step = entries.length > 1 ? (W - pad * 2) / (entries.length - 1) : 0;
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);
  const pts = entries.map(([, v], i) => [pad + i * step, y(v)] as const);
  const line = pts.map(([x, yy]) => `${x},${yy}`).join(" ");
  const area = `${pad},${H - pad} ${line} ${pad + (entries.length - 1) * step},${H - pad}`;

  return (
    <div className="card">
      <h2 className="mb-2 font-semibold">{title}</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={title}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b94ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5b94ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#areaFill)" />
        <polyline points={line} fill="none" stroke="#5b94ff" strokeWidth="2" />
        {pts.map(([x, yy], i) => (
          <circle key={i} cx={x} cy={yy} r="2.5" fill="#5b94ff" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-neutral-500">
        <span>{entries[0][0]}</span>
        <span>{entries[entries.length - 1][0]}</span>
      </div>
    </div>
  );
}
