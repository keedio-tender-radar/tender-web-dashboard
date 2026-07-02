"use client";

import { use, useEffect, useState } from "react";

import {
  api,
  trafficLight,
  type ActivityEvent,
  type Analysis,
  type AskAnswer,
  type Duplicate,
  type Extraction,
  type GeneratedDoc,
  type LearningInsights,
  type Note,
  type SubmissionPackage,
  type Tender,
  type TenderScore,
  type Workspace,
} from "@/lib/api";
import { MarketContextPanel } from "@/components/MarketContextPanel";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ScoreBreakdownBars } from "@/components/ScoreBreakdownBars";
import { cpvLabel } from "@/lib/cpv";
import { toast } from "@/components/Toaster";

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
  const [pkg, setPkg] = useState<SubmissionPackage | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteBody, setNoteBody] = useState("");
  const [activity, setActivity] = useState<ActivityEvent[]>([]);

  function load() {
    Promise.all([api.getTender(id), api.getScore(id)])
      .then(([t, s]) => {
        setTender(t);
        setScore(s);
      })
      .catch((e) => setError(String(e)));
    api.learningInsights(id).then(setInsights).catch(() => setInsights(null));
    api.generatedDocuments(id).then(setDrafts).catch(() => setDrafts([]));
    api.getAnalysis(id).then(setAnalysis).catch(() => setAnalysis(null));
    api.getDuplicates(id).then(setDuplicates).catch(() => setDuplicates([]));
    api.getNotes(id).then(setNotes).catch(() => setNotes([]));
    api.getActivity(id).then(setActivity).catch(() => setActivity([]));
  }

  async function addNote() {
    if (!noteBody.trim()) return;
    try {
      await api.addNote(id, noteBody.trim(), "equipo");
      setNoteBody("");
      setNotes(await api.getNotes(id));
      api.getActivity(id).then(setActivity).catch(() => {});
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(load, [id]);

  async function doGenerateDrafts() {
    setGenerating(true);
    try {
      // Asíncrono: se lanza en segundo plano y sondeamos el estado (evita timeouts del navegador).
      await api.generateOfferDrafts(id);
      toast("Generando borradores… (puede tardar hasta ~1 min)");
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      for (let i = 0; i < 40; i++) {
        await sleep(3000);
        const st = await api.offerDraftsStatus(id);
        if (st.status === "ok") {
          setDrafts(await api.generatedDocuments(id));
          toast(`Borradores generados: ${st.count ?? ""}`);
          break;
        }
        if (st.status === "error") {
          setError(`Generación fallida: ${st.detail ?? "error"}`);
          break;
        }
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setGenerating(false);
    }
  }

  async function doExtractPliego() {
    setGenerating(true);
    try {
      const r = await api.extractPliego(id);
      toast(
        r.cached
          ? `Pliego analizado: ${r.chars.toLocaleString("es-ES")} caracteres`
          : "No se pudo extraer el pliego",
        r.cached ? "success" : "error",
      );
    } catch (e) {
      toast(String(e), "error");
    } finally {
      setGenerating(false);
    }
  }

  async function saveDecision() {
    try {
      await api.recordDecision(id, {
        decision,
        outcome,
        reason: reason || undefined,
        final_score: score?.total,
      });
      toast(`Decisión registrada: ${decision}/${outcome}`);
      setReason("");
      api.learningInsights(id).then(setInsights).catch(() => {});
      api.getActivity(id).then(setActivity).catch(() => {});
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
      toast("Re-analizado con el pliego: score actualizado.");
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
    try {
      const ws = await api.markInteresting(id);
      setWorkspace(ws);
      toast("Marcada como interesante: expediente creado.");
      load();
    } catch (e) {
      setError(String(e));
    }
  }

  async function doPreparePackage() {
    setGenerating(true);
    try {
      const p = await api.prepareSubmissionPackage(id);
      setPkg(p);
      setDrafts(await api.generatedDocuments(id));
      toast(`Paquete preparado: ${p.documents} documento(s).`);
      load();
    } catch (e) {
      setError(String(e));
    } finally {
      setGenerating(false);
    }
  }

  async function act(action: string) {
    try {
      await api.postAction(id, action);
      toast(`Acción registrada: ${action}`);
      load();
    } catch (e) {
      setError(String(e));
    }
  }

  if (error) return <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>;
  if (!tender)
    return (
      <section className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando ficha">
        <div className="skeleton h-7 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-24 w-full" />
      </section>
    );

  return (
    <section className="flex flex-col gap-5 fade-up">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold sm:text-3xl">{tender.title}</h1>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ScoreBadge score={score} />
          <span className="text-sm">{trafficLight(score, tender.deadline).label}</span>
        </div>
      </div>

      <nav className="sticky top-[58px] z-20 -mx-2 flex flex-wrap gap-x-4 gap-y-1 border-b border-[var(--border)] bg-[rgba(10,14,26,0.85)] px-2 py-2 text-sm backdrop-blur">
        {[
          ["scoring", "Scoring"],
          ["pliego", "Pliego"],
          ["preguntar", "Preguntar"],
          ["decision", "Decisión"],
          ["expediente", "Expediente"],
          ["notas", "Notas"],
          ["historial", "Historial"],
        ].map(([id_, label]) => (
          <a key={id_} href={`#${id_}`} className="text-neutral-400 hover:text-white">
            {label}
          </a>
        ))}
      </nav>

      <div className="grid gap-1 text-sm text-neutral-300">
        <span>Fuente: {tender.source} · Estado: {tender.status}</span>
        <span>
          Presupuesto:{" "}
          <b className="tnum font-semibold text-neutral-100">
            {tender.budget_amount != null
              ? `${tender.budget_amount.toLocaleString("es-ES")} ${tender.currency}`
              : "s/d"}
          </b>
        </span>
        <span>Plazo: {tender.deadline ? tender.deadline.slice(0, 10) : "s/d"}</span>
        {tender.cpv.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tender.cpv.map((c) => (
              <span key={c} className="rounded bg-[#0b1020] px-2 py-0.5 text-xs text-neutral-300">
                {cpvLabel(c)}
              </span>
            ))}
          </div>
        )}
        {tender.url && (
          <a href={tender.url} target="_blank" rel="noreferrer" className="text-brand">
            Anuncio original →
          </a>
        )}
        {duplicates.length > 0 && (
          <span className="text-neutral-400">
            También publicada en:{" "}
            {duplicates.map((d, i) => (
              <span key={d.id}>
                {i > 0 && " · "}
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noreferrer" className="text-brand uppercase">
                    {d.source}
                  </a>
                ) : (
                  <span className="uppercase">{d.source}</span>
                )}
              </span>
            ))}
          </span>
        )}
      </div>

      {tender.summary && <p className="text-neutral-200">{tender.summary}</p>}

      {analysis?.summary && (
        <div className="card">
          <h2 className="mb-1 font-semibold">Análisis IA</h2>
          <p className="whitespace-pre-wrap text-sm text-neutral-200">{analysis.summary}</p>
          {analysis.model_version && (
            <p className="mt-1 text-xs text-neutral-500">modelo: {analysis.model_version}</p>
          )}
        </div>
      )}

      {score && (
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="scoring" className="font-semibold scroll-mt-24">Scoring Go/No-Go</h2>
            <span className="text-sm text-neutral-400">{score.total}/100</span>
          </div>
          <div className="mb-3">
            <ScoreBreakdownBars breakdown={score.breakdown} />
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

      <div className="flex flex-col gap-3 card">
        <div className="flex items-center justify-between">
          <h2 id="pliego" className="font-semibold scroll-mt-24">Pliego / documento</h2>
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

      <div className="flex flex-col gap-3 card">
        <h2 id="preguntar" className="font-semibold scroll-mt-24">Preguntar al pliego</h2>
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doAsk()}
            placeholder="¿Qué solvencia técnica exige el pliego?"
            className="grow rounded-lg border border-[var(--border)] bg-[#0b1020] px-3 py-2 text-sm"
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
        <div className="flex flex-col gap-2 card">
          <h2 id="decision" className="font-semibold scroll-mt-24">Decisión (alimenta el aprendizaje)</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[#0b1020] px-2 py-1.5 text-sm"
            >
              {DECISIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[#0b1020] px-2 py-1.5 text-sm"
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
            className="rounded-lg border border-[var(--border)] bg-[#0b1020] px-3 py-1.5 text-sm"
          />
          <button
            onClick={saveDecision}
            className="self-start rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Registrar decisión
          </button>
        </div>

        <div className="flex flex-col gap-2 card">
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

      <MarketContextPanel tenderId={id} />

      <div className="flex flex-col gap-3 card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="expediente" className="font-semibold scroll-mt-24">Expediente</h2>
          <div className="flex gap-2">
            <button
              onClick={doMarkInteresting}
              className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
            >
              ⭐ Interesa → crear expediente
            </button>
            <button
              onClick={doExtractPliego}
              disabled={generating}
              title="Descarga y analiza el PDF del pliego (mejora scoring, matriz y plan)"
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-brand disabled:opacity-50"
            >
              {generating ? "…" : "🔍 Analizar pliego"}
            </button>
            <button
              onClick={doGenerateDrafts}
              disabled={generating}
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-brand disabled:opacity-50"
            >
              {generating ? "…" : "📝 Generar borradores"}
            </button>
            <button
              onClick={doPreparePackage}
              disabled={generating}
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-brand disabled:opacity-50"
            >
              {generating ? "…" : "📦 Preparar paquete"}
            </button>
            {drafts.length > 0 && (
              <>
                <a
                  href={api.packageDocxUrl(id)}
                  className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-brand"
                >
                  ⬇ Word
                </a>
                <a
                  href={api.packagePdfUrl(id)}
                  className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-brand"
                >
                  ⬇ PDF
                </a>
                <a
                  href={api.packageMdUrl(id)}
                  className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-brand"
                >
                  ⬇ .md
                </a>
              </>
            )}
            <a
              href={api.planXlsxUrl(id)}
              title="Plan de proyecto: requerimientos, cronograma y estimación de costes"
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:border-brand"
            >
              📊 Plan (Excel)
            </a>
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
        {pkg && (
          <div className="flex flex-col gap-2 border-t border-neutral-800 pt-3 text-sm">
            <p className="text-neutral-300">
              📦 Paquete de presentación · {pkg.documents} documento(s)
            </p>
            <details>
              <summary className="cursor-pointer text-neutral-200">Manifiesto del expediente</summary>
              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded bg-[#0b1020] p-2 text-xs text-neutral-300">
                {pkg.manifest_md}
              </pre>
            </details>
            <p className="text-neutral-400">Pendiente (revisión humana):</p>
            <ul className="list-inside list-disc text-neutral-300">
              {pkg.pending_human.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="text-xs text-neutral-500">{pkg.note}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 card">
        <h2 id="notas" className="font-semibold scroll-mt-24">Notas del equipo</h2>
        <div className="flex gap-2">
          <input
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Añade una nota…"
            className="grow rounded-lg border border-[var(--border)] bg-[#0b1020] px-3 py-2 text-sm"
          />
          <button
            onClick={addNote}
            disabled={!noteBody.trim()}
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            Añadir
          </button>
        </div>
        {notes.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin notas todavía.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notes.map((n) => (
              <li key={n.id} className="rounded-lg bg-[#0b1020] p-2 text-sm">
                <p className="whitespace-pre-wrap text-neutral-200">{n.body}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {n.author ?? "anónimo"} · {n.created_at.slice(0, 16).replace("T", " ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {activity.length > 0 && (
        <div className="card">
          <h2 id="historial" className="mb-2 font-semibold scroll-mt-24">Historial</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {activity.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0">
                  {e.kind === "decision" ? "⚖️" : e.kind === "note" ? "📝" : "•"}
                </span>
                <div className="min-w-0">
                  <span className="text-neutral-200">{e.text}</span>
                  {e.detail && <span className="text-neutral-400"> — {e.detail}</span>}
                  <span className="ml-1 text-xs text-neutral-500">
                    {e.actor ? `${e.actor} · ` : ""}
                    {e.at.slice(0, 16).replace("T", " ")}
                  </span>
                </div>
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
    </section>
  );
}
