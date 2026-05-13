"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Code2,
  FileText,
  Wand2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkline } from "@/components/charts/Sparkline";
import { BarChart } from "@/components/charts/BarChart";
import { Donut } from "@/components/charts/Donut";
import { api } from "@/lib/api";
import type { ArtifactType, DashboardStats } from "@/lib/types";
import { cn, formatDate, scoreColor } from "@/lib/utils";

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [healthOk, setHealthOk] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([api.health().catch(() => null), api.stats().catch(() => null)]).then(
      ([h, s]) => {
        if (!alive) return;
        setHealthOk(Boolean(h));
        setStats(s);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Header title="Dashboard" searchPlaceholder="Search" />
      <div className="mx-auto w-full max-w-[1500px] space-y-5 p-6 lg:p-8">
        {/* Top: 2/3 grid — left 2x2 stat cards, right tall conversion-rate card */}
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
            <StatCard
              label="Total Evaluations"
              value={stats?.total_evaluations ?? 0}
              delta={deltaFromTimeline(stats)}
              data={timelineCounts(stats)}
              loading={!stats}
            />
            <StatCard
              label="Average Score"
              value={stats ? stats.avg_score.toFixed(1) : "0.0"}
              suffix="/10"
              delta={deltaFromAvgScore(stats)}
              data={timelineScores(stats)}
              loading={!stats}
            />
            <StatCard
              label="Average Latency"
              value={stats ? `${(stats.avg_latency_ms / 1000).toFixed(1)}s` : "0.0s"}
              hint="guard + critic"
              data={timelineCounts(stats)}
              loading={!stats}
            />
            <StatCard
              label="Repair Rate"
              value={stats ? `${(stats.repair_rate * 100).toFixed(1)}%` : "0.0%"}
              hint="JSON repair fired"
              data={timelineCounts(stats)}
              loading={!stats}
              isPositive={false}
            />
          </div>

          {/* Big right card — Conversion Rate equivalent */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Calibration confidence</p>
              <p className="metric-num mt-3 text-4xl">
                {confidencePct(stats)}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Median-of-3 reliability target
              </p>
              <div className="mt-6">
                <BarChart
                  data={barData(stats)}
                  height={210}
                  color="hsl(var(--chart-1))"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onboarding hero — shown when DB is empty */}
        {(!stats || stats.total_evaluations === 0) && (
          <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/[0.06] via-card to-card">
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Get started
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Turn proof-of-work into calibrated feedback.
                </h2>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Submit a brief, a draft, or a snippet of code. The critic returns
                  rubric scores, missing gaps, and the single next-best step — in seconds.
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/evaluate">
                  <Wand2 className="h-4 w-4" /> Evaluate an artifact
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Score distribution card (2/3) + by-type card (1/3) */}
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold">Score distribution</p>
                  <p className="text-xs text-muted-foreground">
                    Last {stats?.total_evaluations ?? 0} evaluations
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60"
                >
                  LAST 30 DAYS <ChevronDown className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-6 grid items-center gap-8 sm:grid-cols-2">
                <div className="flex items-center justify-center">
                  {stats ? (
                    <Donut
                      segments={distributionSegments(stats)}
                      centerLabel="Total"
                      centerValue={`${stats.total_evaluations}`}
                    />
                  ) : (
                    <Skeleton className="h-[220px] w-[220px] rounded-full" />
                  )}
                </div>
                <div className="space-y-2.5">
                  {(stats?.score_distribution ?? PLACEHOLDER_DISTRIBUTION).map((b, i) => (
                    <div
                      key={b.label}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ background: DIST_COLORS[i] }}
                        />
                        <span className="text-sm font-medium capitalize">{b.label}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {b.min.toFixed(0)}–{b.max === 10.01 ? "10" : b.max.toFixed(0)}
                        </span>
                        <span className="min-w-[2.5rem] text-right text-sm font-semibold tabular-nums">
                          {b.count}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* By artifact type — Customers Location twin */}
          <Card>
            <CardContent className="p-6">
              <p className="text-base font-semibold">By artifact type</p>
              <p className="text-xs text-muted-foreground">Coverage across rubric families</p>
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

        {/* Recent activity */}
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
                  <p className="text-sm text-muted-foreground">No evaluations yet.</p>
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
                          <Link href={`/history?id=${it.evaluation_id}`}>Open</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>fl101 Critic Agent · Track C · Applied AI Engineer Assessment</span>
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                healthOk === null
                  ? "bg-muted-foreground"
                  : healthOk
                    ? "bg-emerald-500"
                    : "bg-rose-500",
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

/* ---------------------------- subcomponents --------------------------- */

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  hint?: string;
  data: number[];
  delta?: { value: number; positive: boolean } | null;
  loading: boolean;
  isPositive?: boolean;
}

function StatCard({
  label,
  value,
  suffix,
  hint,
  data,
  delta,
  loading,
  isPositive = true,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <p className="metric-num text-[2.25rem] leading-none">
            {loading ? (
              <Skeleton className="h-10 w-28" />
            ) : (
              <>
                {value}
                {suffix ? (
                  <span className="ml-1 align-baseline text-base font-medium text-muted-foreground">
                    {suffix}
                  </span>
                ) : null}
              </>
            )}
          </p>
          <Sparkline
            data={
              data.length > 0
                ? data
                : Array(8)
                    .fill(0)
                    .map((_, i) => i + 1)
            }
            width={140}
            height={56}
            color={isPositive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))"}
          />
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          {delta ? (
            <>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold",
                  delta.positive ? "text-emerald-600" : "text-rose-600",
                )}
              >
                {delta.positive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {delta.value.toFixed(2)}%
              </span>
              <span className="text-muted-foreground">in Last 14 Days</span>
            </>
          ) : (
            <span className="text-muted-foreground">{hint}</span>
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
              className="block h-full rounded-full bg-primary"
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

/* ---------------------------- helpers --------------------------- */

const DIST_COLORS = [
  "hsl(var(--chart-1))", // blue — excellent
  "hsl(var(--chart-2))", // emerald — strong
  "hsl(var(--chart-3))", // orange — mixed
  "hsl(var(--chart-4))", // violet — weak
];

const PLACEHOLDER_DISTRIBUTION = [
  { label: "excellent", min: 9, max: 10.01, count: 0 },
  { label: "strong", min: 7, max: 9, count: 0 },
  { label: "mixed", min: 5, max: 7, count: 0 },
  { label: "weak", min: 1, max: 5, count: 0 },
];

const TYPE_ICONS: Record<ArtifactType, typeof FileText> = {
  brief: FileText,
  draft: BookOpen,
  code: Code2,
};

function distributionSegments(stats: DashboardStats) {
  return stats.score_distribution.map((b, i) => ({
    label: b.label,
    value: b.count,
    color: DIST_COLORS[i] ?? "hsl(var(--chart-5))",
  }));
}

function timelineCounts(stats: DashboardStats | null): number[] {
  if (!stats || stats.timeline.length === 0)
    return [2, 3, 4, 3, 5, 4, 6, 5, 4, 6, 7, 5];
  return stats.timeline.map((t) => t.count);
}

function timelineScores(stats: DashboardStats | null): number[] {
  if (!stats || stats.timeline.length === 0)
    return [5, 6, 6, 7, 6, 7, 8, 8, 7, 8, 9, 8];
  return stats.timeline.map((t) => t.avg_score);
}

function deltaFromTimeline(stats: DashboardStats | null) {
  if (!stats || stats.timeline.length < 2) return null;
  const half = Math.floor(stats.timeline.length / 2);
  const a =
    stats.timeline.slice(0, half).reduce((s, t) => s + t.count, 0) /
    Math.max(1, half);
  const b =
    stats.timeline.slice(half).reduce((s, t) => s + t.count, 0) /
    Math.max(1, stats.timeline.length - half);
  if (a === 0) return null;
  const pct = ((b - a) / a) * 100;
  return { value: Math.abs(pct), positive: pct >= 0 };
}

function deltaFromAvgScore(stats: DashboardStats | null) {
  if (!stats || stats.timeline.length < 2) return null;
  const half = Math.floor(stats.timeline.length / 2);
  const a =
    stats.timeline.slice(0, half).reduce((s, t) => s + t.avg_score, 0) /
    Math.max(1, half);
  const b =
    stats.timeline.slice(half).reduce((s, t) => s + t.avg_score, 0) /
    Math.max(1, stats.timeline.length - half);
  if (a === 0) return null;
  const pct = ((b - a) / a) * 100;
  return { value: Math.abs(pct), positive: pct >= 0 };
}

function confidencePct(stats: DashboardStats | null): number {
  if (!stats || stats.total_evaluations === 0) return 0;
  // Heuristic: avg score → base, repair rate → penalty.
  const base = Math.min(100, Math.round((stats.avg_score / 10) * 100));
  const penalty = Math.round(stats.repair_rate * 30);
  return Math.max(0, base - penalty);
}

function barData(stats: DashboardStats | null): number[] {
  // ~30 bars — matches the reference density.
  if (!stats || stats.timeline.length === 0) {
    return [
      3, 5, 4, 6, 5, 8, 7, 9, 6, 8, 5, 7, 10, 8, 9, 11, 7, 10, 8, 12, 9, 11, 8,
      13, 10, 9, 7, 12, 11, 9,
    ];
  }
  const tl = stats.timeline;
  const bars: number[] = [];
  for (let i = 0; i < 30; i++) {
    const t = tl[i % tl.length];
    bars.push(t.count + Math.max(1, t.avg_score));
  }
  return bars;
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
