"use client";
import { Clock, Cpu, Hash, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "./ScoreRing";
import { DimensionScores } from "./DimensionScores";
import { GapsList } from "./GapsList";
import { FeedbackPanel } from "./FeedbackPanel";
import { NextStepCard } from "./NextStepCard";
import type { EvaluationResponse } from "@/lib/types";

interface Props {
  result: EvaluationResponse;
}

export function ResultsPanel({ result }: Props) {
  return (
    <div className="space-y-5">
      <NextStepCard step={result.next_step} />

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <CardTitle className="break-words text-xl">
                {result.title || "Untitled artifact"}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {result.summary}
              </CardDescription>
            </div>
            <div className="shrink-0">
              <ScoreRing score={result.overall_score} size={104} label={false} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {result.artifact_type}
            </Badge>
            <Badge variant="muted" className="gap-1">
              <Layers className="h-3 w-3" />
              {result.metadata.consistency_mode} · {result.metadata.samples_taken} sample
              {result.metadata.samples_taken === 1 ? "" : "s"}
            </Badge>
            <Badge variant="muted" className="gap-1">
              <Cpu className="h-3 w-3" />
              {result.metadata.model}
            </Badge>
            <Badge variant="muted" className="gap-1">
              <Clock className="h-3 w-3" />
              {(result.metadata.latency_ms / 1000).toFixed(1)}s
            </Badge>
            {result.metadata.repair_attempted && (
              <Badge variant="warning">repair fired</Badge>
            )}
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <DimensionScores dimensions={result.dimension_scores} />
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Gaps
              <span className="text-xs font-normal text-muted-foreground">
                {result.gaps.length} flagged
              </span>
            </CardTitle>
            <CardDescription>
              Missing or under-served, ordered by severity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GapsList gaps={result.gaps} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per-dimension feedback</CardTitle>
            <CardDescription>
              Targeted notes for the dimensions worth commenting on.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackPanel items={result.feedback} />
          </CardContent>
        </Card>
      </div>

      <p className="flex items-center justify-end gap-1.5 px-1 text-xs text-muted-foreground">
        <Hash className="h-3 w-3" />
        <code className="rounded bg-secondary px-1.5 py-0.5 font-mono">
          {result.evaluation_id.slice(0, 12)}
        </code>
        <span>· stored in SQLite</span>
      </p>
    </div>
  );
}
