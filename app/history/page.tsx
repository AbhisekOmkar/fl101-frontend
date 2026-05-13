"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Inbox } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultsPanel } from "@/components/evaluator/ResultsPanel";
import { api } from "@/lib/api";
import type { EvaluationListItem, EvaluationResponse } from "@/lib/types";
import { formatDate, scoreColor } from "@/lib/utils";

export default function HistoryPage() {
  return (
    <Suspense fallback={<HistoryShell />}>
      <HistoryInner />
    </Suspense>
  );
}

function HistoryShell() {
  return (
    <>
      <Header title="History" subtitle="Past evaluations stored in this session." />
      <div className="grid gap-6 p-6 lg:grid-cols-5 lg:p-8">
        <div className="lg:col-span-2 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </>
  );
}

function HistoryInner() {
  const search = useSearchParams();
  const initialId = search.get("id");
  const [items, setItems] = useState<EvaluationListItem[] | null>(null);
  const [selected, setSelected] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .listEvaluations(100)
      .then((r) => alive && setItems(r.items))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!initialId || selected) return;
    setLoading(true);
    api
      .getEvaluation(initialId)
      .then(setSelected)
      .finally(() => setLoading(false));
  }, [initialId, selected]);

  const openOne = async (id: string) => {
    setLoading(true);
    setSelected(null);
    try {
      const r = await api.getEvaluation(id);
      setSelected(r);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        title="History"
        subtitle="Past evaluations stored in this session."
      />
      <div className="grid gap-6 p-6 lg:grid-cols-5 lg:p-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Evaluations</CardTitle>
              <CardDescription>
                {items?.length ?? "—"} in memory (newest first)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {items === null ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nothing yet.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {items.map((it) => {
                    const active = selected?.evaluation_id === it.evaluation_id;
                    return (
                      <li key={it.evaluation_id}>
                        <button
                          onClick={() => openOne(it.evaluation_id)}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition-colors hover:bg-accent/5 ${
                            active ? "border-accent/40 bg-accent/5" : ""
                          }`}
                        >
                          <div className="min-w-0 space-y-0.5">
                            <p className="truncate text-sm font-medium">
                              {it.title || "Untitled artifact"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(it.created_at)}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <Badge variant="outline" className="capitalize">
                              {it.artifact_type}
                            </Badge>
                            <span
                              className={`text-sm font-semibold tabular-nums ${scoreColor(it.overall_score)}`}
                            >
                              {it.overall_score.toFixed(1)}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {!selected && !loading && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <ChevronLeft className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Pick an evaluation on the left to see the full report.
                </p>
              </CardContent>
            </Card>
          )}
          {loading && (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}
          {selected && (
            <div className="space-y-3">
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                <ChevronLeft className="h-4 w-4" /> Clear
              </Button>
              <ResultsPanel result={selected} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
