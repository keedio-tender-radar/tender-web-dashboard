// Leyenda del semáforo de oportunidad.

const ITEMS: [string, string][] = [
  ["🟢", "Prioritaria — buen score y plazo operativo"],
  ["🟡", "Revisar — score medio, partner o plazo próximo"],
  ["🔴", "Descartar — NO-GO, score bajo o vencida"],
  ["⚪", "Sin datos suficientes"],
];

export function SemaphoreLegend() {
  return (
    <details className="text-sm text-neutral-400">
      <summary className="cursor-pointer hover:text-white">¿Qué significa el semáforo?</summary>
      <ul className="mt-2 flex flex-col gap-1">
        {ITEMS.map(([icon, txt]) => (
          <li key={icon} className="flex gap-2">
            <span>{icon}</span>
            <span>{txt}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
