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

export const api = {
  apiUrl: API_URL,
  listTenders: (status?: string) =>
    req<Tender[]>(`/api/tenders${status ? `?status=${status}` : ""}`),
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
