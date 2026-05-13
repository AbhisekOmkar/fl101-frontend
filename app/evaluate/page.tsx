"use client";
import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ArtifactInputForm } from "@/components/evaluator/ArtifactInput";
import { ResultsPanel } from "@/components/evaluator/ResultsPanel";
import { EvaluationProgress } from "@/components/evaluator/EvaluationProgress";
import { ErrorAlert } from "@/components/evaluator/ErrorAlert";
import { Card, CardContent } from "@/components/ui/card";
import { api, ApiException } from "@/lib/api";
import type {
  ApiError,
  ArtifactInput,
  ArtifactType,
  ConsistencyMode,
  EvaluationResponse,
} from "@/lib/types";

export default function EvaluatePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [progressMeta, setProgressMeta] = useState<{
    type: ArtifactType;
    consistency: ConsistencyMode;
  }>({ type: "brief", consistency: "high" });

  const submit = async (input: ArtifactInput) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setProgressMeta({
      type: input.artifact_type,
      consistency: input.consistency ?? "high",
    });
    try {
      const r = await api.evaluate(input);
      setResult(r);
    } catch (e) {
      if (e instanceof ApiException) setError(e.payload);
      else
        setError({
          error_code: "CLIENT_ERROR",
          message: e instanceof Error ? e.message : "Unknown error",
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Evaluate"
        subtitle="Submit an artifact and receive rubric-anchored feedback."
        searchPlaceholder="Search past evaluations…"
      />
      <div className="mx-auto w-full max-w-[1400px] p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-4 lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-20 space-y-4">
              <ArtifactInputForm loading={loading} onSubmit={submit} />
              {loading && (
                <EvaluationProgress
                  active={loading}
                  artifactType={progressMeta.type}
                  consistency={progressMeta.consistency}
                />
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-4 lg:col-span-7 xl:col-span-8">
            {error && (
              <ErrorAlert
                errorCode={error.error_code}
                message={error.message}
                suggested={error.suggested_type ?? null}
              />
            )}
            {!result && !error && !loading && <EmptyState />}
            {loading && !result && <LoadingHero />}
            {result && <ResultsPanel result={result} />}
          </div>
        </div>
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <Card className="overflow-hidden border-dashed bg-card">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Wand2 className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold tracking-tight">Ready when you are.</p>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            Pick an artifact type on the left, paste your content, and the critic will
            return rubric scores, gaps, and the single next-best step.
          </p>
        </div>
        <p className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Defaults to high-consistency mode (3 samples in parallel)
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Right-pane companion to the EvaluationProgress card on the left.
 * Shows skeleton "placeholders" for the result panel so the page never looks empty.
 */
function LoadingHero() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.06] via-card to-card">
        <CardContent className="p-6 lg:p-7">
          <div className="flex items-start gap-4">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
              <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/30" />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Next best step
              </span>
              <div className="space-y-2.5">
                <div className="shimmer-bg h-5 w-3/4 rounded" />
                <div className="shimmer-bg h-4 w-5/6 rounded" />
                <div className="shimmer-bg h-4 w-2/3 rounded" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <div className="shimmer-bg h-5 w-1/2 rounded" />
            <div className="shimmer-bg h-3.5 w-4/5 rounded" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="shimmer-bg h-3.5 w-24 rounded" />
                  <div className="shimmer-bg h-3.5 w-8 rounded" />
                </div>
                <div className="shimmer-bg h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
