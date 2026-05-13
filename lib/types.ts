// Shared types — mirror app/models on the backend.

export type ArtifactType = "brief" | "draft" | "code";
export type ConsistencyMode = "fast" | "high";
export type Severity = "low" | "medium" | "high";
export type CodeLanguage = "python" | "javascript" | "typescript" | "go" | "java" | "other";

export interface ArtifactInput {
  artifact_type: ArtifactType;
  content: string;
  language?: CodeLanguage | null;
  consistency?: ConsistencyMode | null;
  title?: string | null;
}

export interface DimensionScore {
  key: string;
  name: string;
  score: number;
  rationale: string;
}

export interface FeedbackItem {
  dimension: string;
  feedback: string;
}

export interface Gap {
  title: string;
  severity: Severity;
  why: string;
}

export interface NextStep {
  action: string;
  rationale: string;
  estimated_effort_minutes: number;
}

export interface EvaluationMetadata {
  model: string;
  consistency_mode: ConsistencyMode;
  samples_taken: number;
  repair_attempted: boolean;
  latency_ms: number;
  artifact_type: ArtifactType;
  rubric_version: string;
}

export interface EvaluationResponse {
  evaluation_id: string;
  artifact_type: ArtifactType;
  title?: string | null;
  overall_score: number;
  dimension_scores: DimensionScore[];
  feedback: FeedbackItem[];
  gaps: Gap[];
  next_step: NextStep;
  summary: string;
  metadata: EvaluationMetadata;
  created_at: string;
}

export interface EvaluationListItem {
  evaluation_id: string;
  artifact_type: ArtifactType;
  title?: string | null;
  overall_score: number;
  created_at: string;
}

export interface EvaluationListResponse {
  items: EvaluationListItem[];
  total: number;
}

export interface RubricDimension {
  key: string;
  name: string;
  description: string;
  anchors: Record<string, string>;
}

export interface Rubric {
  artifact_type: ArtifactType;
  description: string;
  dimensions: RubricDimension[];
}

export interface ApiError {
  error_code: string;
  message: string;
  failure_mode?: string;
  suggested_type?: ArtifactType;
}

export interface DashboardStats {
  total_evaluations: number;
  avg_score: number;
  avg_latency_ms: number;
  repair_rate: number;
  by_type: { artifact_type: ArtifactType; count: number; avg_score: number }[];
  score_distribution: { label: string; min: number; max: number; count: number }[];
  timeline: { date: string; count: number; avg_score: number }[];
  recent: {
    evaluation_id: string;
    artifact_type: ArtifactType;
    title: string | null;
    overall_score: number;
    created_at: string;
  }[];
}

export interface EvalRunSummary {
  n_items: number;
  n_evaluated: number;
  overall_mae: number;
  per_dimension: { key: string; mae: number; pearson: number | null; n: number }[];
  gap_recall: number;
  items: {
    id: string;
    artifact_type: ArtifactType;
    overall_score: number;
    expected_overall: number;
    abs_error: number;
    matched_gaps: string[];
    missed_gaps: string[];
    error?: string | null;
  }[];
  consistency_mode: ConsistencyMode;
}
