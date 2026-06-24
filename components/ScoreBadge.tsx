import type { TenderScore } from "@/lib/api";

const REC_LABEL: Record<string, string> = {
  go: "GO",
  revisar: "REVISAR",
  partner: "PARTNER",
  no_go: "NO-GO",
};

function color(total: number): string {
  if (total >= 80) return "bg-green-600";
  if (total >= 60) return "bg-amber-500";
  if (total >= 40) return "bg-orange-600";
  return "bg-red-600";
}

export function ScoreBadge({ score }: { score: TenderScore | null }) {
  if (!score) {
    return <span className="rounded-full bg-neutral-700 px-2 py-0.5 text-xs">sin score</span>;
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${color(
        score.total,
      )}`}
    >
      {score.total}/100 · {REC_LABEL[score.recommendation] ?? score.recommendation}
    </span>
  );
}
