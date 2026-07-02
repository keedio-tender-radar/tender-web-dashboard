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
  const [lastX, lastY] = pts[pts.length - 1];
  const lastValue = values[values.length - 1];
  // Id único por título → evita colisiones de <defs> si hay varias áreas en la página.
  const gid = `area-${title.replace(/\W+/g, "")}`;

  return (
    <div className="card">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        <span className="tnum text-xs text-neutral-400">último: {lastValue}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={title}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b94ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5b94ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#${gid})`} />
        <polyline
          points={line}
          fill="none"
          stroke="#5b94ff"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {pts.slice(0, -1).map(([x, yy], i) => (
          <circle key={i} cx={x} cy={yy} r="2" fill="#5b94ff" fillOpacity="0.7" />
        ))}
        {/* Mes más reciente: punto destacado con halo. */}
        <circle cx={lastX} cy={lastY} r="5" fill="#5b94ff" fillOpacity="0.2" />
        <circle cx={lastX} cy={lastY} r="3" fill="#5b94ff" />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
        <span>{entries[0][0]}</span>
        <span>{entries[entries.length - 1][0]}</span>
      </div>
    </div>
  );
}
