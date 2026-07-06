const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Tender {
  id: string;
  source: string;
  source_id: string;
  title: string;
  summary: string | null;
  cpv: string[];
  buyer: string | null;
  budget_amount: number | null;
  currency: string;
  publication_date: string | null;
  deadline: string | null;
  url: string | null;
  status: string;
}

export interface ScoreFactor {
  kind: "positive" | "negative";
  message: string;
}

export interface TenderScore {
  id: string;
  tender_id: string;
  total: number;
  breakdown: Record<string, number>;
  recommendation: "go" | "revisar" | "partner" | "no_go";
  hard_rules: string[];
  factors: ScoreFactor[];
  model_version: string;
}

export interface TenderWithScore {
  tender: Tender;
  score: TenderScore | null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  // Reintentos ante fallo de red: cubre arranque en frío (scale-to-zero) y reinicios por deploy
  // de la API. Presupuesto ~45s (2+4+6+8+8+8+8) para absorber cold-starts largos y restarts.
  const MAX_ATTEMPTS = 8;
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        ...init,
      });
      if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
      return res.json() as Promise<T>;
    } catch (e) {
      lastErr = e;
      // Solo reintenta errores de red (TypeError: Failed to fetch), no errores HTTP.
      if (e instanceof Error && e.message.startsWith("API ")) throw e;
      if (attempt < MAX_ATTEMPTS - 1) await sleep(Math.min(2000 * (attempt + 1), 8000));
    }
  }
  throw new Error(
    `No se pudo conectar con la API (${API_URL}). El servicio puede estar arrancando; reintenta en unos segundos. ${lastErr}`,
  );
}

export interface ListParams {
  status?: string;
  q?: string;
  order?: string;
  limit?: number;
  offset?: number;
  source?: string;
  contracting_body?: string;
  recommendation?: string;
  traffic_light?: string;
  min_score?: number;
  max_days_remaining?: number;
}

export type TrafficLight = "green" | "yellow" | "red" | "gray";

export interface LearningInsights {
  external_tender_id: string;
  similar_count: number;
  submitted_similar_count: number;
  won_similar_count: number;
  lost_similar_count: number;
  average_historical_score: number | null;
  recommendation: string;
  similar_tenders: {
    tender_id: string;
    title: string;
    buyer: string | null;
    decision: string;
    outcome: string | null;
    final_score: number | null;
    similarity: number;
  }[];
}

export interface DecisionInput {
  decision: string;
  outcome?: string;
  final_score?: number;
  reason?: string;
  tags?: string[];
}

export interface Workspace {
  tender_id: string;
  status: string;
  workspace: string;
  folders: string[];
  required_documents: string[];
  note: string;
}

export interface SavedAlert {
  id: string;
  name: string;
  enabled: boolean;
  min_score: number | null;
  cpv_prefix: string | null;
  min_budget: number | null;
  source: string | null;
  traffic_light: string | null;
  q: string | null;
}

export interface Profile {
  keywords_positive: string[];
  keywords_negative: string[];
  cpv_preferred: string[];
  cpv_excluded: string[];
  areas: string[];
  team: string[];
  project_months: number;
  hourly_rate: number;
  margin: number;
  go_threshold: number;
  revisar_threshold: number;
}

export interface ActivityEvent {
  kind: "action" | "decision" | "note";
  at: string;
  text: string;
  actor: string | null;
  detail: string | null;
}

export interface Note {
  id: string;
  author: string | null;
  body: string;
  created_at: string;
}

export interface SnapshotItem {
  tender_id: string;
  title: string;
  source: string;
  score: number;
  recommendation: string;
  traffic_light: string;
  traffic_light_label: string;
  deadline: string | null;
  days_remaining: number | null;
}

export interface DailySnapshot {
  date: string | null;
  number: number;
  count: number;
  items: SnapshotItem[];
}

export interface MarketStats {
  top_buyers: Record<string, number>;
  by_month: Record<string, number>;
  avg_budget_by_source: Record<string, number>;
}

export interface Competitor {
  supplier: string;
  wins: number;
  total_awarded: number;
  avg_baja: number | null;
  share?: number | null;
}

export interface MarketBuyer {
  buyer: string;
  awards: number;
  total_awarded: number;
}

export interface MarketCpv {
  cpv_division: string;
  awards: number;
  total_awarded: number;
}

export interface Concentration {
  hhi: number | null;
  label: string | null;
  competitors: number;
}

export interface MarketOverview {
  awards: number;
  total_awarded: number;
  avg_baja: number | null;
  concentration?: Concentration;
  top_competitor: Competitor | null;
  top_buyer: MarketBuyer | null;
  top_cpv_division: MarketCpv | null;
}

export interface CompetitorContract {
  title: string | null;
  buyer: string | null;
  cpv_division: string | null;
  budget_amount: number | null;
  awarded_amount: number | null;
  baja: number | null;
  award_date: string | null;
  url: string | null;
}

export interface CompetitorProfile {
  supplier: string;
  wins: number;
  total_awarded: number;
  avg_baja: number | null;
  share: number | null;
  by_buyer: MarketBuyer[];
  by_cpv: MarketCpv[];
  contracts: CompetitorContract[];
}

export interface Incumbent {
  supplier: string | null;
  award_date: string | null;
  awarded_amount: number | null;
  title: string | null;
  url: string | null;
  buyer_awards: number;
}

export interface MarketContext {
  cpv_division: string | null;
  sample_size: number;
  likely_winners: Competitor[];
  expected_baja: number | null;
  avg_awarded: number | null;
  concentration?: Concentration;
  incumbent?: Incumbent | null;
}

export interface Duplicate {
  id: string;
  source: string;
  source_id: string;
  url: string | null;
  title: string;
}

export interface Analysis {
  summary: string | null;
  factors: ScoreFactor[];
  recommendation: string | null;
  model_version?: string;
}

export interface GeneratedDoc {
  id: string;
  kind: string;
  title: string;
  content: string;
  generated_by: string;
}

export interface ExpedientFile {
  id: string;
  filename: string;
  folder: string;
  size: number;
  content_type: string | null;
  download_url: string;
}

export interface SubmissionPackage {
  tender_id: string;
  workspace: string;
  package: Record<string, string[]>;
  documents: number;
  required_documents: string[];
  pending_human: string[];
  manifest_md: string;
  note: string;
}

// Semáforo client-side (réplica de services/semaphore.py) para no llamar N veces a la API.
export function trafficLight(score: TenderScore | null, deadline: string | null): {
  light: TrafficLight;
  label: string;
  text: string;
} {
  const total = score?.total ?? null;
  const rec = score?.recommendation ?? null;
  const days = deadline ? Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000) : null;
  if (total === null && days === null) return { light: "gray", label: "⚪ Sin datos", text: "Sin datos" };
  if (days !== null && days < 0) return { light: "red", label: "🔴 Vencida", text: "Vencida" };
  if (rec === "no_go" || (total !== null && total < 50))
    return { light: "red", label: "🔴 Descartar", text: "Descartar" };
  if (rec === "revisar" || rec === "partner" || (total !== null && total < 70) || (days !== null && days <= 7))
    return { light: "yellow", label: "🟡 Revisar", text: "Revisar" };
  if (total !== null && total >= 70 && (days === null || days > 7))
    return { light: "green", label: "🟢 Prioritaria", text: "Prioritaria" };
  return { light: "gray", label: "⚪ Sin datos", text: "Sin datos" };
}

export interface Stats {
  total: number;
  by_status: Record<string, number>;
  by_source: Record<string, number>;
  by_recommendation: Record<string, number>;
  by_cpv: Record<string, number>;
  go_count: number;
  go_budget_total: number;
  scored_count: number;
  avg_score: number;
  last_ingested_at: string | null;
  last_scored_at: string | null;
}

export const api = {
  apiUrl: API_URL,
  stats: () => req<Stats>("/api/tenders/stats"),
  exportCsvUrl: (params: { status?: string; q?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    if (params.q) qs.set("q", params.q);
    const s = qs.toString();
    return `${API_URL}/api/tenders/export.csv${s ? `?${s}` : ""}`;
  },
  listTenders: (params: ListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    if (params.q) qs.set("q", params.q);
    if (params.limit != null) qs.set("limit", String(params.limit));
    if (params.offset != null) qs.set("offset", String(params.offset));
    const s = qs.toString();
    return req<Tender[]>(`/api/tenders${s ? `?${s}` : ""}`);
  },
  searchWithScores: (params: ListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    if (params.q) qs.set("q", params.q);
    if (params.order) qs.set("order", params.order);
    if (params.source) qs.set("source", params.source);
    if (params.contracting_body) qs.set("contracting_body", params.contracting_body);
    if (params.recommendation) qs.set("recommendation", params.recommendation);
    if (params.traffic_light) qs.set("traffic_light", params.traffic_light);
    if (params.min_score != null) qs.set("min_score", String(params.min_score));
    if (params.max_days_remaining != null)
      qs.set("max_days_remaining", String(params.max_days_remaining));
    if (params.limit != null) qs.set("limit", String(params.limit));
    if (params.offset != null) qs.set("offset", String(params.offset));
    const s = qs.toString();
    return req<TenderWithScore[]>(`/api/tenders/search${s ? `?${s}` : ""}`);
  },
  learningInsights: (id: string) => req<LearningInsights>(`/api/tenders/${id}/learning-insights`),
  recordDecision: (id: string, body: DecisionInput) =>
    req(`/api/tenders/${id}/decision`, { method: "POST", body: JSON.stringify(body) }),
  markInteresting: (id: string) =>
    req<Workspace>(`/api/tenders/${id}/mark-interesting`, { method: "POST" }),
  generateOfferDrafts: (id: string) =>
    req<{ status: string }>(`/api/tenders/${id}/generate-offer-drafts`, { method: "POST" }),
  offerDraftsStatus: (id: string) =>
    req<{ status: string; detail?: string | null; count?: number | null }>(
      `/api/tenders/${id}/offer-drafts-status`,
    ),
  generatedDocuments: (id: string) =>
    req<GeneratedDoc[]>(`/api/tenders/${id}/generated-documents`),
  listDocuments: (id: string) =>
    req<{ files: ExpedientFile[]; configured: boolean }>(`/api/tenders/${id}/documents`),
  uploadDocument: (id: string, folder: string, file: File) => {
    const fd = new FormData();
    fd.append("folder", folder);
    fd.append("file", file);
    // headers vacío → el navegador pone el multipart boundary (no application/json).
    return req<{ id: string; filename: string; folder: string; size: number }>(
      `/api/tenders/${id}/documents/upload`,
      { method: "POST", body: fd, headers: {} },
    );
  },
  deleteDocument: (id: string, docId: string) =>
    req<{ ok: boolean }>(`/api/tenders/${id}/documents/${docId}`, { method: "DELETE" }),
  documentDownloadUrl: (id: string, docId: string) =>
    `${API_URL}/api/tenders/${id}/documents/${docId}/download`,
  prepareSubmissionPackage: (id: string) =>
    req<SubmissionPackage>(`/api/tenders/${id}/prepare-submission-package`, { method: "POST" }),
  getProfile: () => req<Profile>("/api/profile"),
  updateProfile: (body: Profile) =>
    req<Profile>("/api/profile", { method: "PUT", body: JSON.stringify(body) }),
  getAnalysis: (id: string) => req<Analysis>(`/api/tenders/${id}/analysis`),
  getDuplicates: (id: string) => req<Duplicate[]>(`/api/tenders/${id}/duplicates`),
  getActivity: (id: string) => req<ActivityEvent[]>(`/api/tenders/${id}/activity`),
  getNotes: (id: string) => req<Note[]>(`/api/tenders/${id}/notes`),
  addNote: (id: string, body: string, author?: string) =>
    req<Note>(`/api/tenders/${id}/notes`, {
      method: "POST",
      body: JSON.stringify({ body, author }),
    }),
  marketStats: () => req<MarketStats>("/api/tenders/stats/market"),
  // Inteligencia de mercado (adjudicaciones históricas, MVP-5).
  marketOverview: () => req<MarketOverview>("/api/market/overview"),
  marketCompetitors: (cpvDivision?: string, limit = 10) =>
    req<{ count: number; competitors: Competitor[] }>(
      `/api/market/competitors?limit=${limit}` +
        (cpvDivision ? `&cpv_division=${cpvDivision}` : ""),
    ),
  marketBuyers: (limit = 10) =>
    req<{ buyers: MarketBuyer[] }>(`/api/market/buyers?limit=${limit}`),
  marketCpv: (limit = 10) =>
    req<{ divisions: MarketCpv[] }>(`/api/market/cpv?limit=${limit}`),
  marketAwardsCsvUrl: () => `${API_URL}/api/market/awards.csv`,
  competitorProfile: (name: string) =>
    req<CompetitorProfile>(`/api/market/competitor?name=${encodeURIComponent(name)}`),
  tenderMarketContext: (id: string) =>
    req<MarketContext>(`/api/market/tender/${id}/context`),
  dailySnapshot: () => req<DailySnapshot>("/api/tenders/daily-snapshot"),
  dailySnapshots: (limit = 14) =>
    req<{ date: string; count: number; items: SnapshotItem[] }[]>(
      `/api/tenders/daily-snapshots?limit=${limit}`,
    ),
  marketCsvUrl: () => `${API_URL}/api/tenders/stats/market.csv`,
  packageMdUrl: (id: string) => `${API_URL}/api/tenders/${id}/package.md`,
  packageDocxUrl: (id: string) => `${API_URL}/api/tenders/${id}/package.docx`,
  packagePdfUrl: (id: string) => `${API_URL}/api/tenders/${id}/package.pdf`,
  planXlsxUrl: (id: string) => `${API_URL}/api/tenders/${id}/plan.xlsx`,
  planAgilUrl: (id: string) => `${API_URL}/api/tenders/${id}/plan-agil.xlsx`,
  planDetalladoUrl: (id: string) => `${API_URL}/api/tenders/${id}/plan-detallado.xlsx`,
  calendarIcsUrl: () => `${API_URL}/api/tenders/calendar.ics`,
  listAlerts: () => req<SavedAlert[]>("/api/alerts"),
  createAlert: (a: Partial<SavedAlert>) =>
    req<SavedAlert>("/api/alerts", { method: "POST", body: JSON.stringify(a) }),
  deleteAlert: (id: string) => req<void>(`/api/alerts/${id}`, { method: "DELETE" }),
  alertMatches: (days = 2) =>
    req<{ tender: Tender; score: TenderScore | null; alerts: string[] }[]>(
      `/api/alerts/matches?days=${days}`,
    ),
  servicesStatus: () =>
    req<{
      doc_service: boolean;
      analysis_service: boolean;
      visual_rag: boolean;
      llm: boolean | null;
      llm_models?: string[];
    }>("/api/tenders/services"),
  runsSummary: () =>
    req<{ jobs: { job: string; status: string; detail: string | null; count: number | null; at: string | null }[] }>(
      "/api/runs/summary",
    ),
  recalibrate: () =>
    req<{ applied: boolean; reason?: string; won: number; lost: number; go_threshold: number; revisar_threshold: number }>(
      "/api/profile/recalibrate",
      { method: "POST" },
    ),
  extractPliego: (id: string) =>
    req<{ cached: boolean; chars: number; extracted_at: string | null }>(
      `/api/tenders/${id}/pliego`,
      { method: "POST" },
    ),
  authStatus: () => req<{ enabled: boolean }>("/api/auth/status"),
  authCheck: (password: string) =>
    req<{ ok: boolean }>("/api/auth/check", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  top: (limit = 10) => req<TenderWithScore[]>(`/api/tenders/top?limit=${limit}`),
  urgent: (days = 7) => req<TenderWithScore[]>(`/api/tenders/urgent?days=${days}`),
  getTender: (id: string) => req<Tender>(`/api/tenders/${id}`),
  getScore: async (id: string): Promise<TenderScore | null> => {
    const res = await fetch(`${API_URL}/api/tenders/${id}/score`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  },
  postAction: (id: string, action: string) =>
    req(`/api/tenders/${id}/actions`, {
      method: "POST",
      body: JSON.stringify({ action, actor: "dashboard" }),
    }),
  extract: (id: string) => req<Extraction>(`/api/tenders/${id}/extract`, { method: "POST" }),
  reanalyze: (id: string) => req<TenderScore>(`/api/tenders/${id}/reanalyze`, { method: "POST" }),
  ask: (id: string, question: string, topK = 5) =>
    req<AskAnswer>(`/api/tenders/${id}/ask`, {
      method: "POST",
      body: JSON.stringify({ question, top_k: topK }),
    }),
};

export interface AskSource {
  n?: number;
  section?: string | null;
  content?: string;
  page?: number;
}

export interface AskAnswer {
  backend: string;
  answer: string | null;
  grounded?: boolean;
  sources: AskSource[];
}

export interface ExtractionChunk {
  ordinal: number;
  section: string | null;
  content: string;
}

export interface Extraction {
  kind: string;
  char_count: number;
  chunk_count: number;
  chunks: ExtractionChunk[];
}
