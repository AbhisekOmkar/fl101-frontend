"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Code2,
  FileText,
  RefreshCw,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkline } from "@/components/charts/Sparkline";
import { BarChart } from "@/components/charts/BarChart";
import { api } from "@/lib/api";
import type { ArtifactType, DashboardStats } from "@/lib/types";
import { cn, formatDate, scoreColor } from "@/lib/utils";

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    const [h, s] = await Promise.all([
      api.health().catch(() => null),
      api.stats().catch(() => null),
    ]);
    setHealthOk(Boolean(h));
    setStats(s);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Header title="Dashboard" />
      <div className="mx-auto w-full max-w-[1500px] space-y-5 p-6 lg:p-8">
        {/* Greeting + action row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Hello, Abhisek
              </h1>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                30 days
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Rubric-anchored evaluations, gaps, and next-best steps.{" "}
              <span className="hidden sm:inline">
                · Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={refreshing}>
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Sliders className="h-3.5 w-3.5" />
              Filters
            </Button>
            <Button size="sm" asChild>
              <Link href="/evaluate">
                <Sparkles className="h-3.5 w-3.5" /> New evaluation
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI strip — 5 cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            label="Total evaluations"
            primary={stats ? `${stats.total_evaluations}` : "0"}
            secondary={
              stats
                ? `${stats.timeline.reduce((s, t) => s + t.count, 0)} this period`
                : ""
            }
            loading={!stats}
          />
          <KpiCard
            label="Avg score"
            primary={stats ? stats.avg_score.toFixed(1) : "0.0"}
            primarySuffix="/10"
            secondary={`${(stats ? stats.avg_score >= 7 ? "above target" : "below target" : "")}`}
            loading={!stats}
          />
          <KpiCard
            label="Avg latency"
            primary={stats ? `${(stats.avg_latency_ms / 1000).toFixed(1)}s` : "0.0s"}
            secondary="guard + critic"
            loading={!stats}
          />
          <KpiCard
            label="Repair rate"
            primary={stats ? `${(stats.repair_rate * 100).toFixed(0)}%` : "0%"}
            secondary="JSON repair fired"
            loading={!stats}
          />
          <KpiCard
            label="Backend"
            primary={healthOk === null ? "…" : healthOk ? "Healthy" : "Down"}
            secondary={healthOk ? "200 OK on /health" : "/health unreachable"}
            tone={healthOk === false ? "danger" : "default"}
            loading={healthOk === null}
          />
        </div>

        {/* Pipeline strip — 6 cards with lime sparklines */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <PipelineCard label="AI screened" value={stats?.total_evaluations ?? 0} bars={generateBars(stats, 12)} />
          <PipelineCard label="Briefs" value={countByType(stats, "brief")} bars={generateBars(stats, 8, 0.7)} />
          <PipelineCard label="Drafts" value={countByType(stats, "draft")} bars={generateBars(stats, 8, 0.5)} />
          <PipelineCard label="Code" value={countByType(stats, "code")} bars={generateBars(stats, 8, 0.4)} />
          <PipelineCard
            label="High-score"
            value={countAbove(stats, 8)}
            bars={generateBars(stats, 8, 0.6)}
            footnote={`${pct(countAbove(stats, 8), stats?.total_evaluations ?? 0)}% ≥ 8`}
          />
          <PipelineCard
            label="Needs repair"
            value={stats ? Math.round(stats.repair_rate * stats.total_evaluations) : 0}
            bars={generateBars(stats, 8, 0.2)}
            tone="muted"
          />
        </div>

        {/* Daily activity + side panel */}
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">Daily activity</p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.total_evaluations ?? 0} evaluations · {stats ? stats.avg_score.toFixed(1) : "0.0"} avg score
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary/60"
                >
                  Last 30 days <ChevronDown className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-6">
                <BarChart
                  data={barData(stats)}
                  height={220}
                  color="hsl(var(--chart-1))"
                  className="w-full"
                />
              </div>
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <LegendDot color="hsl(var(--chart-1))" label="Evaluations" />
                <LegendDot color="hsl(var(--chart-2))" label="Avg score" />
                <LegendDot color="hsl(var(--chart-3))" label="Repair fired" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-base font-semibold">By artifact type</p>
              <p className="text-xs text-muted-foreground">
                Coverage across rubric families
              </p>
              <div className="mt-5 space-y-1">
                <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-1 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span>Type</span>
                  <span className="text-right">Count</span>
                  <span className="w-16 text-right">Share</span>
                </div>
                {byType(stats).map((row) => (
                  <ByTypeRow key={row.type} {...row} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent evaluations */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-base font-semibold">Recent evaluations</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.total_evaluations ?? "—"} total · stored in SQLite
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/history">
                  View all <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-4">
              {!stats ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : stats.recent.length === 0 ? (
                <div className="rounded-xl border border-dashed py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No evaluations yet.
                  </p>
                  <Button asChild size="sm" className="mt-3">
                    <Link href="/evaluate">Run your first evaluation</Link>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y rounded-xl border bg-card">
                  {stats.recent.map((it) => (
                    <li
                      key={it.evaluation_id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-sm font-medium">
                          {it.title || "Untitled artifact"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {it.artifact_type} · {formatDate(it.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-lg font-semibold tabular-nums ${scoreColor(it.overall_score)}`}
                        >
                          {it.overall_score.toFixed(1)}
                        </span>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/history?id=${it.evaluation_id}`}>
                            Open
                          </Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>fl101 Critic Agent · Track C · Applied AI Engineer Assessment</span>
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                healthOk === null
                  ? "bg-muted-foreground"
                  : healthOk
                    ? "bg-success"
                    : "bg-destructive",
              )}
            />
            {healthOk === null
              ? "Checking backend…"
              : healthOk
                ? "Backend healthy"
                : "Backend unreachable"}
          </span>
        </div>
      </div>
    </>
  );
}

/* ----------------------------- subcomponents ----------------------------- */

function KpiCard({
  label,
  primary,
  primarySuffix,
  secondary,
  loading,
  tone = "default",
}: {
  label: string;
  primary: string | number;
  primarySuffix?: string;
  secondary?: string;
  loading?: boolean;
  tone?: "default" | "danger";
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <p
            className={cn(
              "metric-num text-3xl",
              tone === "danger" && "text-destructive",
            )}
          >
            {primary}
            {primarySuffix && (
              <span className="ml-1 align-baseline text-sm font-medium text-muted-foreground">
                {primarySuffix}
              </span>
            )}
          </p>
        )}
        {secondary && (
          <p className="text-[11px] text-muted-foreground">{secondary}</p>
        )}
      </CardContent>
    </Card>
  );
}

function PipelineCard({
  label,
  value,
  bars,
  footnote,
  tone = "default",
}: {
  label: string;
  value: number;
  bars: number[];
  footnote?: string;
  tone?: "default" | "muted";
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <Sparkline
          data={bars}
          width={140}
          height={36}
          color={tone === "muted" ? "hsl(var(--muted-foreground))" : "hsl(var(--accent))"}
          className="!w-full"
        />
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="metric-num mt-0.5 text-2xl">{value.toLocaleString()}</p>
          {footnote && (
            <p className="text-[11px] text-muted-foreground">{footnote}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ByTypeRow({
  type,
  count,
  share,
  icon: Icon,
}: {
  type: string;
  count: number;
  share: number;
  icon: typeof FileText;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg px-1 py-2.5">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border bg-card">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
        <span className="text-sm font-medium capitalize">{type}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm tabular-nums">{count}</span>
        <span className="flex w-16 items-center justify-end gap-2">
          <span className="h-1.5 w-10 overflow-hidden rounded-full bg-secondary">
            <span
              className="block h-full rounded-full bg-accent"
              style={{ width: `${Math.max(4, Math.round(share * 100))}%` }}
            />
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {Math.round(share * 100)}%
          </span>
        </span>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

/* ----------------------------- helpers ----------------------------- */

const TYPE_ICONS: Record<ArtifactType, typeof FileText> = {
  brief: FileText,
  draft: BookOpen,
  code: Code2,
};

function countByType(stats: DashboardStats | null, t: ArtifactType): number {
  return stats?.by_type.find((r) => r.artifact_type === t)?.count ?? 0;
}

function countAbove(stats: DashboardStats | null, threshold: number): number {
  if (!stats) return 0;
  return stats.score_distribution
    .filter((b) => b.min >= threshold)
    .reduce((s, b) => s + b.count, 0);
}

function pct(num: number, denom: number): string {
  if (!denom) return "0";
  return `${Math.round((num / denom) * 100)}`;
}

/** Always returns 30 bars — pads with zeros on the left so the chart never collapses to a wall. */
function barData(stats: DashboardStats | null): number[] {
  const days = 30;
  if (!stats || stats.timeline.length === 0) {
    return [3, 5, 4, 6, 5, 8, 7, 9, 6, 8, 5, 7, 10, 8, 9, 11, 7, 10, 8, 12, 9, 11, 8, 13, 10, 9, 7, 12, 11, 9];
  }
  const values = stats.timeline.map(
    (t) => t.count + Math.max(0, t.avg_score / 2),
  );
  if (values.length >= days) return values.slice(-days);
  const padded = Array<number>(days - values.length).fill(0).concat(values);
  return padded;
}

/** Pipeline sparkline — always returns `count` points; zero-pads sparse data. */
function generateBars(
  stats: DashboardStats | null,
  count: number,
  scale = 1,
): number[] {
  if (!stats || stats.timeline.length === 0) {
    return Array.from({ length: count }, (_, i) =>
      Math.max(1, Math.round((Math.sin(i / 1.5) + 1.5) * 5 * scale)),
    );
  }
  const values = stats.timeline.map((t) => Math.max(0, t.count * scale));
  if (values.length >= count) return values.slice(-count);
  return Array<number>(count - values.length).fill(0).concat(values);
}

function byType(stats: DashboardStats | null) {
  const rows: { type: string; count: number; share: number; icon: typeof FileText }[] = [];
  const total = stats?.total_evaluations ?? 0;
  const types: ArtifactType[] = ["brief", "draft", "code"];
  for (const t of types) {
    const found = stats?.by_type.find((r) => r.artifact_type === t);
    const count = found?.count ?? 0;
    rows.push({
      type: t,
      count,
      share: total > 0 ? count / total : 0,
      icon: TYPE_ICONS[t],
    });
  }
  return rows;
}
