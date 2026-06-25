import Link from "next/link";

import { trafficLight, type TenderWithScore } from "@/lib/api";
import { ScoreBadge } from "@/components/ScoreBadge";

function money(amount: number | null, currency = "EUR"): string {
  if (amount == null) return "s/d";
  return `${amount.toLocaleString("es-ES")} ${currency}`;
}

export function TenderCard({ item }: { item: TenderWithScore }) {
  const t = item.tender;
  return (
    <Link
      href={`/tenders/${t.id}`}
      className="block rounded-xl border border-neutral-800 bg-[#141a2e] p-4 transition hover:border-brand"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug">{t.title}</h3>
        <ScoreBadge score={item.score} />
      </div>
      <p className="text-sm text-neutral-400">
        {money(t.budget_amount, t.currency)}
        {t.deadline ? ` · cierre ${t.deadline.slice(0, 10)}` : ""}
        {t.buyer ? ` · ${t.buyer}` : ""}
      </p>
      <p className="mt-1 flex items-center justify-between text-xs uppercase tracking-wide text-neutral-500">
        <span>
          {t.source} · {t.status}
        </span>
        <span className="normal-case">{trafficLight(item.score, t.deadline).label}</span>
      </p>
    </Link>
  );
}
