import Link from "next/link";
import { Check, X } from "lucide-react";

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
  const days = t.deadline
    ? Math.floor((new Date(t.deadline).getTime() - Date.now()) / 86400000)
    : null;
  const closeCls =
    days == null
      ? ""
      : days < 0
        ? "text-neutral-500"
        : days <= 3
          ? "text-rose-400"
          : days <= 7
            ? "text-amber-400"
            : "text-neutral-400";
  return (
    <div className="card card-hover flex flex-col">
      <Link href={`/tenders/${t.id}`} className="block">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug">{t.title}</h3>
          <ScoreBadge score={item.score} />
        </div>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-400">
          <span className="tnum font-medium text-neutral-300">
            {money(t.budget_amount, t.currency)}
          </span>
          {days != null && (
            <>
              <span aria-hidden className="text-neutral-600">
                ·
              </span>
              <span
                className={`tnum ${closeCls}`}
                title={t.deadline ? `Cierre ${t.deadline.slice(0, 10)}` : undefined}
              >
                {days < 0 ? "vencida" : `cierre en ${days}d`}
              </span>
            </>
          )}
          {t.buyer && (
            <>
              <span aria-hidden className="text-neutral-600">
                ·
              </span>
              <span className="truncate">{t.buyer}</span>
            </>
          )}
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
        <p className="mt-2 flex items-center justify-between text-xs uppercase tracking-wide text-neutral-400">
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
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs hover:border-emerald-500 hover:text-emerald-300"
          >
            <Check className="h-3.5 w-3.5" /> Interesa
          </button>
          <button
            onClick={() => onAction(t.id, "discarded")}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs hover:border-rose-500 hover:text-rose-300"
          >
            <X className="h-3.5 w-3.5" /> Descartar
          </button>
        </div>
      )}
    </div>
  );
}
