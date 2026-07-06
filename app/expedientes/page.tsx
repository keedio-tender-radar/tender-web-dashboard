"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { Check, Circle, FolderOpen } from "lucide-react";

import { api, type ExpedienteRow } from "@/lib/api";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SkeletonGrid } from "@/components/Skeleton";

const STEPS: [keyof ExpedienteRow["steps"], string][] = [
  ["pliego", "Pliego"],
  ["borradores", "Borradores"],
  ["paquete", "Paquete"],
];

function closeCls(d: number | null): string {
  if (d == null) return "text-neutral-500";
  if (d < 0) return "text-neutral-500";
  if (d <= 3) return "text-rose-400";
  if (d <= 7) return "text-amber-400";
  return "text-neutral-400";
}

function barCls(pct: number): string {
  if (pct >= 100) return "bg-emerald-500";
  if (pct >= 34) return "bg-brand";
  return "bg-amber-500";
}

export default function ExpedientesPage() {
  const [rows, setRows] = useState<ExpedienteRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .expedientes()
      .then(setRows)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>;

  // Ordena por cierre más próximo (los sin fecha, al final).
  const ordered = [...rows].sort((a, b) => {
    const da = a.days_remaining ?? 9999;
    const db = b.days_remaining ?? 9999;
    return da - db;
  });

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Expedientes en curso</h1>
        <p className="mt-1 text-neutral-400">
          Licitaciones en seguimiento y su progreso hacia la oferta.
        </p>
      </div>

      {loading ? (
        <SkeletonGrid count={4} />
      ) : ordered.length === 0 ? (
        <p className="text-neutral-500">
          No hay expedientes en curso. Marca una licitación como «Interesa» en su ficha para
          empezar a prepararla.
        </p>
      ) : (
        <div className="grid gap-3 stagger sm:grid-cols-2">
          {ordered.map((r) => (
            <div key={r.tender.id} className="card card-hover flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/tenders/${r.tender.id}`}
                  className="font-semibold leading-snug hover:text-brand"
                >
                  {r.tender.title}
                </Link>
                <ScoreBadge score={r.score} />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-neutral-400">
                  <span>Completitud del expediente</span>
                  <span className="tnum">{r.completeness}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#0b1020]">
                  <div
                    className={`h-full rounded-full ${barCls(r.completeness)}`}
                    style={{ width: `${r.completeness}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {STEPS.map(([k, label]) => {
                  const done = r.steps[k];
                  return (
                    <span
                      key={k}
                      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
                        done
                          ? "border-emerald-500/40 text-emerald-300"
                          : "border-[var(--border)] text-neutral-500"
                      }`}
                    >
                      {done ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />} {label}
                    </span>
                  );
                })}
              </div>

              <p className="flex items-center gap-3 text-xs text-neutral-400">
                {r.days_remaining != null && (
                  <span className={`tnum ${closeCls(r.days_remaining)}`}>
                    {r.days_remaining < 0 ? "vencida" : `cierre en ${r.days_remaining}d`}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FolderOpen className="h-3.5 w-3.5" /> {r.docs_count} doc(s)
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
