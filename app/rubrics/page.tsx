"use client";
import { useEffect, useState } from "react";
import { BookOpen, Code2, FileText, ScrollText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ArtifactType, Rubric } from "@/lib/types";

const TYPE_ICON: Record<ArtifactType, typeof FileText> = {
  brief: FileText,
  draft: BookOpen,
  code: Code2,
};

const ANCHOR_ORDER = ["1", "5", "10"];
const ANCHOR_LABEL: Record<string, string> = {
  "1": "Score 1 · weak",
  "5": "Score 5 · mixed",
  "10": "Score 10 · excellent",
};

export default function RubricsPage() {
  const [data, setData] = useState<Record<string, Rubric> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<ArtifactType>("brief");

  useEffect(() => {
    let alive = true;
    api.listRubrics().then(
      (r) => alive && setData(r),
      (e) => alive && setError(e instanceof Error ? e.message : "Failed to load rubrics"),
    );
    return () => {
      alive = false;
    };
  }, []);

  const rubric = data?.[active] ?? null;

  return (
    <>
      <Header
        title="Rubrics"
        subtitle="The anchors the critic scores against — one per artifact type."
      />
      <div className="mx-auto w-full max-w-[1200px] space-y-5 p-6 lg:p-8">
        {/* Type tabs */}
        <div className="flex flex-wrap gap-2">
          {(["brief", "draft", "code"] as ArtifactType[]).map((t) => {
            const Icon = TYPE_ICON[t];
            const isActive = active === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActive(t)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="capitalize">{t}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <Card>
            <CardContent className="p-6 text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {!data && !error && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        )}

        {rubric && (
          <>
            <Card>
              <CardContent className="space-y-2 p-6">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <ScrollText className="h-3.5 w-3.5" /> {rubric.artifact_type} rubric
                </p>
                <p className="text-sm leading-relaxed text-foreground">
                  {rubric.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {rubric.dimensions.length} dimensions · scored 1–10 each · overall = mean of dimensions
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              {rubric.dimensions.map((d, i) => (
                <Card key={d.key}>
                  <CardHeader className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-[11px] font-semibold text-accent-foreground">
                        {i + 1}
                      </span>
                      {d.name}
                      <span className="ml-auto text-[11px] font-normal uppercase tracking-wider text-muted-foreground">
                        {d.key}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {d.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 border-t pt-4">
                    {ANCHOR_ORDER.filter((a) => d.anchors[a]).map((a) => (
                      <div key={a} className="space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {ANCHOR_LABEL[a]}
                        </p>
                        <p className="text-xs leading-relaxed text-foreground">
                          {d.anchors[a]}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
