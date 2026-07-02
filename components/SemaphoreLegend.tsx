// Leyenda del semáforo de oportunidad.

import { SemaphoreDot } from "@/components/SemaphoreDot";

const ITEMS: [string, string][] = [
  ["green", "Prioritaria — buen score y plazo operativo"],
  ["yellow", "Revisar — score medio, partner o plazo próximo"],
  ["red", "Descartar — NO-GO, score bajo o vencida"],
  ["gray", "Sin datos suficientes"],
];

export function SemaphoreLegend() {
  return (
    <details className="text-sm text-neutral-400">
      <summary className="cursor-pointer hover:text-white">¿Qué significa el semáforo?</summary>
      <ul className="mt-2 flex flex-col gap-1.5">
        {ITEMS.map(([light, txt]) => (
          <li key={light} className="flex items-center gap-2.5">
            <SemaphoreDot light={light} />
            <span>{txt}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
