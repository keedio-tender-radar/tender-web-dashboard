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

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export interface ListParams {
  status?: string;
  q?: string;
  order?: string;
  limit?: number;
  offset?: number;
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
    if (params.limit != null) qs.set("limit", String(params.limit));
    if (params.offset != null) qs.set("offset", String(params.offset));
    const s = qs.toString();
    return req<TenderWithScore[]>(`/api/tenders/search${s ? `?${s}` : ""}`);
  },
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
};
