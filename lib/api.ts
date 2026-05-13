import type {
  ApiError,
  ArtifactInput,
  ConsistencyMode,
  DashboardStats,
  EvalRunSummary,
  EvaluationListResponse,
  EvaluationResponse,
  Rubric,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiException extends Error {
  payload: ApiError;
  status: number;
  constructor(payload: ApiError, status: number) {
    super(payload.message);
    this.payload = payload;
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let payload: ApiError;
    try {
      payload = await res.json();
    } catch {
      payload = {
        error_code: "NETWORK_ERROR",
        message: `Backend returned ${res.status} ${res.statusText}`,
      };
    }
    throw new ApiException(payload, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () =>
    request<{ status: string; version: string; model_critic: string }>("/health"),

  evaluate: (input: ArtifactInput) =>
    request<EvaluationResponse>("/api/evaluate", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  listEvaluations: (limit = 50) =>
    request<EvaluationListResponse>(`/api/evaluations?limit=${limit}`),

  stats: () => request<DashboardStats>("/api/stats"),

  getEvaluation: (id: string) =>
    request<EvaluationResponse>(`/api/evaluations/${id}`),

  listRubrics: () =>
    request<Record<string, Rubric>>("/api/rubrics"),

  runEval: (mode: ConsistencyMode = "fast") =>
    request<EvalRunSummary>(`/api/eval/run?consistency=${mode}`, {
      method: "POST",
    }),

  listGolden: () =>
    request<{ n: number; items: { id: string; title: string | null }[] }>(
      "/api/eval/golden",
    ),
};

export { ApiException };
