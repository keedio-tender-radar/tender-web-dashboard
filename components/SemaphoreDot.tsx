// Punto de estado (semáforo) con halo suave — sustituye a los emojis 🟢🟡🔴⚪.

const MAP: Record<string, string> = {
  green: "bg-emerald-500 ring-emerald-500/25",
  yellow: "bg-amber-500 ring-amber-500/25",
  red: "bg-rose-500 ring-rose-500/25",
  gray: "bg-neutral-500 ring-neutral-500/25",
};

export function SemaphoreDot({ light, className = "" }: { light: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2 w-2 shrink-0 rounded-full ring-4 ${MAP[light] ?? MAP.gray} ${className}`}
    />
  );
}
