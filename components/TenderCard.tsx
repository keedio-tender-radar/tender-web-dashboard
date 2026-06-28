import Link from "next/link";

import { trafficLight, type TenderWithScore } from "@/lib/api";
import { ScoreBadge } from "@/components/ScoreBadge";
import { cpvLabel } from "@/lib/cpv";

function money(amount: number | null, currency = "EUR"): string {
  if (amount == null) return "s/d";
  return `${amount.toLocaleString("es-ES")} ${currency}`;
}

export function TenderCard({
  item,
  onAction,
}: {
  item: TenderWithScore;
  onAction?: (id: string, action: string) => void;
}) {
  const t = item.tender;
  return (
    <div className="card card-hover flex flex-col">
      <Link href={`/tenders/${t.id}`} className="block">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug">{t.title}</h3>
          <ScoreBadge score={item.score} />
        </div>
        <p className="text-sm text-neutral-400">
          {money(t.budget_amount, t.currency)}
          {t.deadline ? ` · cierre ${t.deadline.slice(0, 10)}` : ""}
          {t.buyer ? ` · ${t.buyer}` : ""}
        </p>
        {t.cpv.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {t.cpv.slice(0, 2).map((c) => (
              <span
                key={c}
                className="rounded bg-[#0b1020] px-1.5 py-0.5 text-[11px] text-neutral-400"
              >
                {cpvLabel(c)}
              </span>
            ))}
          </div>
        )}
        <p className="mt-2 flex items-center justify-between text-xs uppercase tracking-wide text-neutral-500">
          <span>
            {t.source} · {t.status}
          </span>
          <span className="normal-case">{trafficLight(item.score, t.deadline).label}</span>
        </p>
      </Link>
      {onAction && (
        <div className="mt-3 flex gap-2 border-t border-[var(--border)] pt-3">
          <button
            onClick={() => onAction(t.id, "interested")}
            className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs hover:border-emerald-500 hover:text-emerald-300"
          >
            ✅ Interesa
          </button>
          <button
            onClick={() => onAction(t.id, "discarded")}
            className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs hover:border-rose-500 hover:text-rose-300"
          >
            ❌ Descartar
          </button>
        </div>
      )}
    </div>
  );
}
