"use client";

import { use, useEffect, useState } from "react";

import {
  api,
  trafficLight,
  type AskAnswer,
  type Extraction,
  type GeneratedDoc,
  type LearningInsights,
  type Tender,
  type TenderScore,
  type Workspace,
} from "@/lib/api";
import { ScoreBadge } from "@/components/ScoreBadge";

const DECISIONS = ["GO", "NO_GO", "REVISAR", "PARTNER", "PRESENTADA", "DESCARTAR"];
const OUTCOMES = ["pendiente", "presentada", "no_presentada", "ganada", "perdida"];

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
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AskAnswer | null>(null);
  const [asking, setAsking] = useState(false);
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [decision, setDecision] = useState("GO");
  const [outcome, setOutcome] = useState("pendiente");
  const [reason, setReason] = useState("");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [drafts, setDrafts] = useState<GeneratedDoc[]>([]);
  const [generating, setGenerating] = useState(false);

  function load() {
    Promise.all([api.getTender(id), api.getScore(id)])
      .then(([t, s]) => {
        setTender(t);
        setScore(s);
      })
      .catch((e) => setError(String(e)));
    api.learningInsights(id).then(setInsights).catch(() => setInsights(null));
    api.generatedDocuments(id).then(setDrafts).catch(() => setDrafts([]));
  }

  useEffect(load, [id]);

  async function doGenerateDrafts() {
    setGenerating(true);
    setMsg(null);
    try {
      const r = await api.generateOfferDrafts(id);
      setMsg(`Borradores generados: ${r.count}`);
      setDrafts(await api.generatedDocuments(id));
    } catch (e) {
      setError(String(e));
    } finally {
      setGenerating(false);
    }
  }

  async function saveDecision() {
    setMsg(null);
    try {
      await api.recordDecision(id, {
        decision,
        outcome,
        reason: reason || undefined,
        final_score: score?.total,
      });
      setMsg(`Decisión registrada: ${decision}/${outcome}`);
      setReason("");
      api.learningInsights(id).then(setInsights).catch(() => {});
    } catch (e) {
      setError(String(e));
    }
  }

  async function doExtract() {
    setExtracting(true);
    setExtractError(null);
    setExtraction(null);
    try {
      setExtraction(await api.extract(id));
    } catch (e) {
      setExtractError(String(e));
    } finally {
      setExtracting(false);
    }
  }

  async function doReanalyze() {
    setExtracting(true);
    setExtractError(null);
    try {
      const newScore = await api.reanalyze(id);
      setScore(newScore);
      setMsg("Re-analizado con el pliego: score actualizado.");
    } catch (e) {
      setExtractError(String(e));
    } finally {
      setExtracting(false);
    }
  }

  async function doAsk() {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    try {
      setAnswer(await api.ask(id, question.trim()));
    } catch (e) {
      setAnswer({ backend: "error", answer: String(e), sources: [] });
    } finally {
      setAsking(false);
    }
  }

  async function doMarkInteresting() {
    setMsg(null);
    try {
      const ws = await api.markInteresting(id);
      setWorkspace(ws);
      setMsg("Marcada como interesante: expediente creado.");
      load();
    } catch (e) {
      setError(String(e));
    }
  }

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
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ScoreBadge score={score} />
          <span className="text-sm">{trafficLight(score, tender.deadline).label}</span>
        </div>
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

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Pliego / documento</h2>
          {tender?.url ? (
            <div className="flex gap-2">
              <button
                onClick={doExtract}
                disabled={extracting}
                className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-brand disabled:opacity-50"
              >
                {extracting ? "…" : "Extraer documento"}
              </button>
              <button
                onClick={doReanalyze}
                disabled={extracting}
                className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
              >
                {extracting ? "…" : "Re-analizar con el pliego"}
              </button>
            </div>
          ) : (
            <span className="text-sm text-neutral-500">Sin URL de documento</span>
          )}
        </div>
        {!tender?.url && (
          <p className="text-sm text-neutral-400">
            Esta licitación no tiene URL de pliego (p. ej. datos de ejemplo). La extracción y el
            re-análisis con el pliego no están disponibles.
          </p>
        )}
        {extractError && <p className="text-sm text-red-300">{extractError}</p>}
        {extraction && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-neutral-400">
              Tipo <span className="font-medium text-neutral-200">{extraction.kind}</span> ·{" "}
              {extraction.char_count.toLocaleString("es-ES")} caracteres ·{" "}
              {extraction.chunk_count} fragmentos
            </p>
            {extraction.chunks.map((c) => (
              <details key={c.ordinal} className="text-sm">
                <summary className="cursor-pointer text-neutral-300">
                  {c.section ?? `Fragmento ${c.ordinal + 1}`}
                </summary>
                <p className="mt-1 whitespace-pre-wrap text-neutral-400">
                  {c.content.slice(0, 600)}
                </p>
              </details>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
        <h2 className="font-semibold">Preguntar al pliego</h2>
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doAsk()}
            placeholder="¿Qué solvencia técnica exige el pliego?"
            className="grow rounded-lg border border-neutral-700 bg-[#0b1020] px-3 py-2 text-sm"
          />
          <button
            onClick={doAsk}
            disabled={asking || !question.trim()}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {asking ? "…" : "Preguntar"}
          </button>
        </div>
        {answer && (
          <div className="flex flex-col gap-2">
            {answer.answer && <p className="whitespace-pre-wrap text-sm">{answer.answer}</p>}
            <p className="text-xs text-neutral-500">
              motor: {answer.backend}
              {answer.sources.length > 0 ? ` · ${answer.sources.length} fragmento(s)` : ""}
            </p>
            {answer.sources.map((s, i) => (
              <details key={i} className="text-sm">
                <summary className="cursor-pointer text-neutral-300">
                  {s.section ?? (s.page != null ? `Página ${s.page}` : `Fuente ${i + 1}`)}
                </summary>
                {s.content && (
                  <p className="mt-1 whitespace-pre-wrap text-neutral-400">{s.content}</p>
                )}
              </details>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
          <h2 className="font-semibold">Decisión (alimenta el aprendizaje)</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-[#0b1020] px-2 py-1.5 text-sm"
            >
              {DECISIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-[#0b1020] px-2 py-1.5 text-sm"
            >
              {OUTCOMES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo (opcional)"
            className="rounded-lg border border-neutral-700 bg-[#0b1020] px-3 py-1.5 text-sm"
          />
          <button
            onClick={saveDecision}
            className="self-start rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Registrar decisión
          </button>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
          <h2 className="font-semibold">Aprendizaje histórico</h2>
          {insights ? (
            <div className="text-sm text-neutral-300">
              <p>{insights.recommendation}</p>
              <p className="mt-1 text-neutral-400">
                Similares: {insights.similar_count} · Presentadas:{" "}
                {insights.submitted_similar_count} · Ganadas: {insights.won_similar_count} ·
                Perdidas: {insights.lost_similar_count}
                {insights.average_historical_score != null &&
                  ` · Score medio: ${insights.average_historical_score}`}
              </p>
              {insights.similar_tenders.slice(0, 3).map((s) => (
                <p key={s.tender_id} className="mt-1 text-neutral-500">
                  • {s.title.slice(0, 50)} — {s.decision}/{s.outcome ?? "?"}
                  {s.final_score != null ? ` (${s.final_score})` : ""}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Sin precedentes en el histórico.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-[#141a2e] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Expediente</h2>
          <div className="flex gap-2">
            <button
              onClick={doMarkInteresting}
              className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
            >
              ⭐ Interesa → crear expediente
            </button>
            <button
              onClick={doGenerateDrafts}
              disabled={generating}
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-brand disabled:opacity-50"
            >
              {generating ? "Generando…" : "📝 Generar borradores"}
            </button>
          </div>
        </div>
        {workspace && (
          <div className="text-sm">
            <p className="text-neutral-300">
              Carpeta: <code className="text-neutral-100">{workspace.workspace}</code>
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {workspace.folders.map((f) => (
                <span key={f} className="rounded bg-[#0b1020] px-2 py-0.5 text-xs text-neutral-300">
                  📁 {f}
                </span>
              ))}
            </div>
            <p className="mt-3 text-neutral-400">Documentos a preparar:</p>
            <ul className="mt-1 list-inside list-disc text-neutral-300">
              {workspace.required_documents.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-neutral-500">{workspace.note}</p>
          </div>
        )}
        {drafts.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-neutral-400">
              Borradores de oferta ({drafts.length}):
            </p>
            {drafts.map((d) => (
              <details key={d.id} className="text-sm">
                <summary className="cursor-pointer text-neutral-200">
                  📄 {d.title}{" "}
                  <span className="text-xs text-neutral-500">({d.generated_by})</span>
                </summary>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded bg-[#0b1020] p-2 text-xs text-neutral-300">
                  {d.content}
                </pre>
              </details>
            ))}
          </div>
        )}
      </div>

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
