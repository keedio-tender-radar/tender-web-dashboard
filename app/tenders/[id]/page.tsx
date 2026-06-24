"use client";

import { use, useEffect, useState } from "react";

import { api, type Tender, type TenderScore } from "@/lib/api";
import { ScoreBadge } from "@/components/ScoreBadge";

const ACTIONS: { action: string; label: string }[] = [
  { action: "interested", label: "✅ Interesa" },
  { action: "discarded", label: "❌ Descartar" },
  { action: "partner", label: "🤝 Partner" },
  { action: "prioritize", label: "📌 Prioritaria" },
];

export default function TenderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tender, setTender] = useState<Tender | null>(null);
  const [score, setScore] = useState<TenderScore | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    Promise.all([api.getTender(id), api.getScore(id)])
      .then(([t, s]) => {
        setTender(t);
        setScore(s);
      })
      .catch((e) => setError(String(e)));
  }

  useEffect(load, [id]);

  async function act(action: string) {
    setMsg(null);
    try {
      await api.postAction(id, action);
      setMsg(`Acción registrada: ${action}`);
      load();
    } catch (e) {
      setError(String(e));
    }
  }

  if (error) return <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>;
  if (!tender) return <p className="text-neutral-500">Cargando…</p>;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold">{tender.title}</h1>
        <ScoreBadge score={score} />
      </div>

      <div className="grid gap-1 text-sm text-neutral-300">
        <span>Fuente: {tender.source} · Estado: {tender.status}</span>
        <span>
          Presupuesto:{" "}
          {tender.budget_amount != null
            ? `${tender.budget_amount.toLocaleString("es-ES")} ${tender.currency}`
            : "s/d"}
        </span>
        <span>Plazo: {tender.deadline ? tender.deadline.slice(0, 10) : "s/d"}</span>
        {tender.cpv.length > 0 && <span>CPV: {tender.cpv.join(", ")}</span>}
        {tender.url && (
          <a href={tender.url} target="_blank" rel="noreferrer" className="text-brand">
            Anuncio original →
          </a>
        )}
      </div>

      {tender.summary && <p className="text-neutral-200">{tender.summary}</p>}

      {score && (
        <div className="rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
          <h2 className="mb-2 font-semibold">Scoring Go/No-Go</h2>
          <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
            {Object.entries(score.breakdown).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-neutral-400">{k.replace(/_/g, " ")}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          <ul className="flex flex-col gap-1 text-sm">
            {score.factors.map((f, i) => (
              <li key={i}>
                {f.kind === "positive" ? "➕" : "➖"} {f.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.action}
            onClick={() => act(a.action)}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:border-brand"
          >
            {a.label}
          </button>
        ))}
      </div>
      {msg && <p className="text-sm text-green-400">{msg}</p>}
    </section>
  );
}
