"use client";

import { useEffect, useState } from "react";

import { api, type AskAnswer, type TenderWithScore } from "@/lib/api";

export default function AskPage() {
  const [tenders, setTenders] = useState<TenderWithScore[]>([]);
  const [tenderId, setTenderId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AskAnswer | null>(null);
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

  async function ask() {
    if (!tenderId || !question.trim()) return;
    setLoading(true);
    setAnswer(null);
    setError(null);
    try {
      setAnswer(await api.ask(tenderId, question.trim()));
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
          Elige una licitación y pregunta sobre su pliego (criterios, solvencia, plazos…).
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
        <select
          value={tenderId}
          onChange={(e) => setTenderId(e.target.value)}
          className="rounded-lg border border-neutral-700 bg-[#0b1020] px-3 py-2 text-sm"
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
            className="grow rounded-lg border border-neutral-700 bg-[#0b1020] px-3 py-2 text-sm"
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

      {answer && (
        <div className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
          {answer.answer && <p className="whitespace-pre-wrap">{answer.answer}</p>}
          <p className="text-xs text-neutral-500">
            motor: {answer.backend}
            {answer.sources.length > 0 ? ` · ${answer.sources.length} fuente(s)` : ""}
          </p>
          {answer.sources.map((s, i) => (
            <details key={i} className="text-sm">
              <summary className="cursor-pointer text-neutral-300">
                {s.section ?? (s.page != null ? `Página ${s.page}` : `Fuente ${i + 1}`)}
              </summary>
              {s.content && <p className="mt-1 whitespace-pre-wrap text-neutral-400">{s.content}</p>}
            </details>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-500">
        El motor usado aparece en cada respuesta: <code>visual-rag</code> (servicio tender-visual-rag
        por expediente) o <code>extractive</code> (texto del pliego) como respaldo. Con el backend
        real PixelRAG/Qwen3-VL la recuperación es visual y la respuesta la genera el modelo
        vision-language con citas de página.
      </p>
    </section>
  );
}
