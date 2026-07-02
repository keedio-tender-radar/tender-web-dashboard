"use client";

import { useEffect, useState } from "react";

import { api, type AskAnswer, type TenderWithScore } from "@/lib/api";

interface Turn {
  question: string;
  answer: AskAnswer;
}

const SUGGESTIONS = [
  "¿Qué solvencia técnica exige el pliego?",
  "¿Cuál es el plazo de presentación?",
  "¿Qué criterios de adjudicación se valoran?",
  "¿Se exige garantía o aval?",
];

/** Resalta las citas [n] del texto de la respuesta para que salten a la vista. */
function renderAnswer(text: string) {
  return text.split(/(\[\d+\])/g).map((part, i) =>
    /^\[\d+\]$/.test(part) ? (
      <sup key={i} className="mx-0.5 rounded bg-brand/20 px-1 text-brand">
        {part}
      </sup>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function AskPage() {
  const [tenders, setTenders] = useState<TenderWithScore[]>([]);
  const [tenderId, setTenderId] = useState("");
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .top(20)
      .then((t) => {
        setTenders(t);
        if (t[0]) setTenderId(t[0].tender.id);
      })
      .catch((e) => setError(String(e)));
  }, []);

  // Cambiar de licitación empieza una conversación nueva (RAG por expediente).
  function onTenderChange(id: string) {
    setTenderId(id);
    setTurns([]);
    setError(null);
  }

  async function ask() {
    const q = question.trim();
    if (!tenderId || !q) return;
    setLoading(true);
    setError(null);
    try {
      const answer = await api.ask(tenderId, q);
      setTurns((prev) => [...prev, { question: q, answer }]);
      setQuestion("");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Pregúntale al pliego</h1>
        <p className="text-neutral-400">
          Elige una licitación y pregunta sobre su pliego (criterios, solvencia, plazos…). Las
          respuestas citan los fragmentos del pliego con <code>[n]</code>.
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}

      <div className="flex flex-col gap-3 card">
        <select
          value={tenderId}
          onChange={(e) => onTenderChange(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[#0b1020] px-3 py-2 text-sm"
        >
          {tenders.length === 0 && <option value="">No hay licitaciones puntuadas</option>}
          {tenders.map((tw) => (
            <option key={tw.tender.id} value={tw.tender.id}>
              {tw.score ? `[${tw.score.total}] ` : ""}
              {tw.tender.title.slice(0, 70)}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="¿Qué solvencia técnica exige el pliego?"
            className="grow rounded-lg border border-[var(--border)] bg-[#0b1020] px-3 py-2 text-sm"
          />
          <button
            onClick={ask}
            disabled={loading || !tenderId || !question.trim()}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "…" : "Preguntar"}
          </button>
        </div>
      </div>

      {turns.length === 0 && !loading && (
        <div className="card flex flex-col gap-2">
          <p className="text-sm text-neutral-400">Empieza por una de estas, o escribe la tuya:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setQuestion(s)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-neutral-300 hover:border-brand hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <p className="text-sm text-neutral-400">🔎 Consultando el pliego…</p>
      )}

      {turns.map((turn, ti) => (
        <div key={ti} className="flex flex-col gap-2 card">
          <p className="text-sm font-medium text-neutral-300">
            <span className="text-neutral-500">Tú:</span> {turn.question}
          </p>
          {turn.answer.answer && (
            <p className="whitespace-pre-wrap">{renderAnswer(turn.answer.answer)}</p>
          )}
          <p className="text-xs text-neutral-500">
            motor: {turn.answer.backend}
            {turn.answer.grounded === false ? " (extractivo)" : ""}
            {turn.answer.sources.length > 0 ? ` · ${turn.answer.sources.length} fuente(s)` : ""}
          </p>
          {turn.answer.sources.map((s, i) => (
            <details key={i} className="text-sm">
              <summary className="cursor-pointer text-neutral-300">
                <span className="mr-1 text-brand">[{s.n ?? i + 1}]</span>
                {s.section ?? (s.page != null ? `Página ${s.page}` : `Fuente ${i + 1}`)}
              </summary>
              {s.content && (
                <p className="mt-1 whitespace-pre-wrap text-neutral-400">{s.content}</p>
              )}
            </details>
          ))}
        </div>
      ))}

      <p className="text-xs text-neutral-500">
        RAG por expediente: la recuperación se filtra siempre por la licitación elegida (ADR-004) y
        la respuesta la redacta el modelo con citas del pliego. Motores: <code>rag</code> (síntesis
        con citas), <code>visual-rag</code> (PixelRAG externo) o <code>extractive</code> (fragmento
        del pliego) como respaldo cuando no hay LLM.
      </p>
    </section>
  );
}
