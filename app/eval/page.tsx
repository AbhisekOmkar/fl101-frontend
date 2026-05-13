"use client";
import { useEffect, useState } from "react";
import { LineChart, Loader2, Play, Target } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { ConsistencyMode, EvalRunSummary } from "@/lib/types";

export default function QualityPage() {
  const [golden, setGolden] = useState<{ n: number; items: { id: string; title: string | null }[] } | null>(null);
  const [summary, setSummary] = useState<EvalRunSummary | null>(null);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<ConsistencyMode>("fast");

  useEffect(() => {
    api.listGolden().then(setGolden).catch(() => setGolden({ n: 0, items: [] }));
  }, []);

  const runEval = async () => {
    setRunning(true);
    setSummary(null);
    try {
      const r = await api.runEval(mode);
      setSummary(r);
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <Header
        title="Quality"
        subtitle="Eval harness — calibration against a hand-graded golden set."
      />
      <div className="space-y-6 p-6 lg:p-8">
        <Card className="overflow-hidden border-accent/30 bg-gradient-to-br from-accent/5 via-card to-card">
          <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <Badge variant="accent" className="gap-1">
                <Target className="h-3 w-3" /> Eval harness
              </Badge>
              <h2 className="text-xl font-semibold tracking-tight">
                Calibrated against {golden?.n ?? "…"} hand-graded artifacts.
              </h2>
              <p className="text-sm text-muted-foreground">
                Runs the critic across the golden set and reports MAE, Pearson, and gap recall.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={mode === "fast" ? "accent" : "outline"}
                size="sm"
                onClick={() => setMode("fast")}
                disabled={running}
              >
                Fast (1 sample)
              </Button>
              <Button
                variant={mode === "high" ? "accent" : "outline"}
                size="sm"
                onClick={() => setMode("high")}
                disabled={running}
              >
                High (3 samples)
              </Button>
              <Button variant="default" size="sm" onClick={runEval} disabled={running}>
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {running ? "Running…" : "Run eval"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Golden set</CardTitle>
            <CardDescription>
              Hand-scored by the developer. Each item has expected dimension scores and expected gaps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!golden ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {golden.items.map((it) => (
                  <li
                    key={it.id}
                    className="rounded-lg border bg-card px-3 py-2 text-sm"
                  >
                    <p className="font-medium">{it.title || it.id}</p>
                    <p className="text-xs text-muted-foreground">{it.id}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {running && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Running…
              </CardTitle>
              <CardDescription>
                Mode: <span className="font-medium">{mode}</span> · this may take 20–60 seconds.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {summary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-accent" />
                Results
              </CardTitle>
              <CardDescription>
                {summary.n_evaluated}/{summary.n_items} items evaluated · mode {summary.consistency_mode}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Metric label="Overall MAE (↓)" value={summary.overall_mae.toFixed(2)} hint="Target ≤ 1.5" />
                <Metric
                  label="Gap recall (↑)"
                  value={`${Math.round(summary.gap_recall * 100)}%`}
                  hint="Target ≥ 50%"
                />
                <Metric
                  label="Items evaluated"
                  value={`${summary.n_evaluated}/${summary.n_items}`}
                  hint="Failures excluded"
                />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium">Per-dimension</h3>
                <ul className="space-y-3">
                  {summary.per_dimension.map((d) => (
                    <li key={d.key} className="rounded-lg border bg-card p-3">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{d.key.replace(/_/g, " ")}</span>
                        <span className="text-muted-foreground">
                          MAE {d.mae.toFixed(2)} · Pearson{" "}
                          {d.pearson === null ? "n/a" : d.pearson.toFixed(2)} · n={d.n}
                        </span>
                      </div>
                      <Progress
                        value={Math.max(0, 100 - d.mae * 20)}
                        indicatorClassName={
                          d.mae <= 1.0 ? "bg-emerald-500" : d.mae <= 1.8 ? "bg-amber-500" : "bg-rose-500"
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium">Per-item</h3>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">id</th>
                        <th className="px-3 py-2 text-left">type</th>
                        <th className="px-3 py-2 text-right">expected</th>
                        <th className="px-3 py-2 text-right">actual</th>
                        <th className="px-3 py-2 text-right">|err|</th>
                        <th className="px-3 py-2 text-left">gaps matched</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.items.map((it) => (
                        <tr key={it.id} className="border-t">
                          <td className="px-3 py-2 font-mono text-xs">{it.id}</td>
                          <td className="px-3 py-2 capitalize">{it.artifact_type}</td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {it.expected_overall.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {it.error ? "—" : it.overall_score.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {it.error ? <Badge variant="destructive">{it.error}</Badge> : it.abs_error.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {it.matched_gaps.length}/{it.matched_gaps.length + it.missed_gaps.length}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
