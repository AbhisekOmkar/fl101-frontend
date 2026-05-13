"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Bot,
  BookOpen,
  Braces,
  Brain,
  Bug,
  CheckCircle2,
  Code2,
  FileSearch,
  FileText,
  Gauge,
  Layers,
  Loader2,
  Microscope,
  Pencil,
  Quote,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  TerminalSquare,
  Type,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ArtifactType, ConsistencyMode } from "@/lib/types";

interface Props {
  active: boolean;
  artifactType: ArtifactType;
  consistency: ConsistencyMode;
}

interface Step {
  key: string;
  label: string;
  icons: { Icon: typeof Code2; tint: string }[];
  /** Rotating phrases shown under the label while this step is active */
  phrases: string[];
}

const STEPS_FOR: Record<ArtifactType, Step[]> = {
  brief: [
    {
      key: "guard",
      label: "Guarding input",
      icons: [
        { Icon: ShieldCheck, tint: "text-sky-500" },
        { Icon: ScanLine, tint: "text-violet-500" },
        { Icon: FileSearch, tint: "text-emerald-500" },
      ],
      phrases: [
        "Checking artifact type",
        "Scanning for injection patterns",
        "Confirming length and shape",
      ],
    },
    {
      key: "rubric",
      label: "Loading rubric",
      icons: [
        { Icon: Target, tint: "text-amber-500" },
        { Icon: Layers, tint: "text-blue-500" },
      ],
      phrases: [
        "Clarity · Structure · Evidence · Specificity · Actionability",
        "Calibrating anchors at 1, 5, 10",
      ],
    },
    {
      key: "score",
      label: "Scoring with the critic",
      icons: [
        { Icon: Brain, tint: "text-blue-600" },
        { Icon: Bot, tint: "text-blue-500" },
        { Icon: Sparkles, tint: "text-violet-500" },
        { Icon: Activity, tint: "text-emerald-500" },
      ],
      phrases: [
        "Reading every paragraph",
        "Anchoring each dimension to the rubric",
        "Drafting per-dimension rationales",
        "Identifying gaps in scope and evidence",
      ],
    },
    {
      key: "aggregate",
      label: "Aggregating samples",
      icons: [
        { Icon: Layers, tint: "text-blue-600" },
        { Icon: Gauge, tint: "text-emerald-500" },
      ],
      phrases: [
        "Computing median per dimension",
        "Deduplicating gaps by title",
        "Choosing the most considered next step",
      ],
    },
    {
      key: "next",
      label: "Picking next-best step",
      icons: [
        { Icon: Sparkles, tint: "text-primary" },
        { Icon: CheckCircle2, tint: "text-emerald-500" },
      ],
      phrases: [
        "The single highest-leverage move",
        "Under an hour of effort",
      ],
    },
  ],
  draft: [
    {
      key: "guard",
      label: "Guarding input",
      icons: [
        { Icon: ShieldCheck, tint: "text-sky-500" },
        { Icon: Type, tint: "text-violet-500" },
        { Icon: FileSearch, tint: "text-emerald-500" },
      ],
      phrases: [
        "Checking this looks like prose",
        "Scanning for injection patterns",
        "Confirming length and shape",
      ],
    },
    {
      key: "rubric",
      label: "Loading rubric",
      icons: [
        { Icon: Quote, tint: "text-amber-500" },
        { Icon: Layers, tint: "text-blue-500" },
      ],
      phrases: [
        "Thesis · Structure · Evidence · Style · Engagement",
        "Calibrating anchors at 1, 5, 10",
      ],
    },
    {
      key: "score",
      label: "Scoring with the critic",
      icons: [
        { Icon: BookOpen, tint: "text-blue-600" },
        { Icon: Pencil, tint: "text-violet-500" },
        { Icon: Brain, tint: "text-blue-500" },
        { Icon: Activity, tint: "text-emerald-500" },
      ],
      phrases: [
        "Reading paragraph by paragraph",
        "Listening for a clear thesis",
        "Sampling sentences for style",
        "Looking for evidence and examples",
      ],
    },
    {
      key: "aggregate",
      label: "Aggregating samples",
      icons: [
        { Icon: Layers, tint: "text-blue-600" },
        { Icon: Gauge, tint: "text-emerald-500" },
      ],
      phrases: [
        "Computing median per dimension",
        "Deduplicating gaps by title",
        "Choosing the most considered next step",
      ],
    },
    {
      key: "next",
      label: "Picking next-best step",
      icons: [
        { Icon: Sparkles, tint: "text-primary" },
        { Icon: CheckCircle2, tint: "text-emerald-500" },
      ],
      phrases: ["The single highest-leverage edit", "Under an hour of effort"],
    },
  ],
  code: [
    {
      key: "guard",
      label: "Guarding input",
      icons: [
        { Icon: ShieldCheck, tint: "text-sky-500" },
        { Icon: TerminalSquare, tint: "text-violet-500" },
        { Icon: FileSearch, tint: "text-emerald-500" },
      ],
      phrases: [
        "Confirming this is code",
        "Scanning for injection patterns",
        "Detecting language family",
      ],
    },
    {
      key: "rubric",
      label: "Loading rubric",
      icons: [
        { Icon: Target, tint: "text-amber-500" },
        { Icon: Layers, tint: "text-blue-500" },
      ],
      phrases: [
        "Correctness · Readability · Structure · Error handling · Testing",
        "Calibrating anchors at 1, 5, 10",
      ],
    },
    {
      key: "score",
      label: "Scoring with the critic",
      icons: [
        { Icon: Code2, tint: "text-blue-600" },
        { Icon: TerminalSquare, tint: "text-sky-500" },
        { Icon: Braces, tint: "text-violet-500" },
        { Icon: Bug, tint: "text-rose-500" },
        { Icon: Microscope, tint: "text-emerald-500" },
      ],
      phrases: [
        "Tracing the happy path",
        "Hunting for off-by-one and boundary bugs",
        "Checking exception handling and silent failures",
        "Reading for naming and intent",
        "Asking whether this is testable",
      ],
    },
    {
      key: "aggregate",
      label: "Aggregating samples",
      icons: [
        { Icon: Layers, tint: "text-blue-600" },
        { Icon: Gauge, tint: "text-emerald-500" },
      ],
      phrases: [
        "Computing median per dimension",
        "Deduplicating gaps by title",
        "Choosing the most considered next step",
      ],
    },
    {
      key: "next",
      label: "Picking next-best step",
      icons: [
        { Icon: Sparkles, tint: "text-primary" },
        { Icon: CheckCircle2, tint: "text-emerald-500" },
      ],
      phrases: ["The single highest-leverage refactor", "Under an hour of effort"],
    },
  ],
};

const TYPE_LABELS: Record<ArtifactType, string> = {
  brief: "brief",
  draft: "draft",
  code: "code",
};

const TYPE_ICON: Record<ArtifactType, typeof FileText> = {
  brief: FileText,
  draft: BookOpen,
  code: Code2,
};

/**
 * Rich, animated evaluation progress card.
 *
 * The backend is non-streaming. We expose the conceptual pipeline visually so
 * the user sees activity rather than a frozen spinner — and we time each step
 * to roughly match the real backend's cadence (guard ~2-3s, scoring 6-10s).
 */
export function EvaluationProgress({ active, artifactType, consistency }: Props) {
  const steps = STEPS_FOR[artifactType];
  const TypeIcon = TYPE_ICON[artifactType];
  const targetMs = consistency === "high" ? 14000 : 8000;

  const [stepIdx, setStepIdx] = useState(0);
  const [iconIdx, setIconIdx] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startedRef = useRef<number>(0);

  // Step advance — weighted so "score" sits longest
  useEffect(() => {
    if (!active) {
      setStepIdx(0);
      setIconIdx(0);
      setPhraseIdx(0);
      setElapsed(0);
      return;
    }
    startedRef.current = performance.now();
    const weights = [0.1, 0.1, 0.55, 0.15, 0.1];
    const segments = weights.map((w) => w * targetMs);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cum = 0;
    for (let i = 1; i < steps.length; i++) {
      cum += segments[i - 1];
      timers.push(setTimeout(() => setStepIdx(i), cum));
    }
    return () => timers.forEach(clearTimeout);
  }, [active, targetMs, steps.length]);

  // Cycle through icons within a step
  useEffect(() => {
    if (!active) return;
    setIconIdx(0);
    const id = setInterval(() => {
      setIconIdx((i) => i + 1);
    }, 700);
    return () => clearInterval(id);
  }, [active, stepIdx]);

  // Cycle through phrases within a step
  useEffect(() => {
    if (!active) return;
    setPhraseIdx(0);
    const id = setInterval(() => {
      setPhraseIdx((i) => i + 1);
    }, 1800);
    return () => clearInterval(id);
  }, [active, stepIdx]);

  // Elapsed time
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setElapsed(performance.now() - startedRef.current);
    }, 120);
    return () => clearInterval(id);
  }, [active]);

  const current = steps[stepIdx];
  const activeIcon = current.icons[iconIdx % current.icons.length];
  const ActiveIcon = activeIcon.Icon;
  const phrase = current.phrases[phraseIdx % current.phrases.length];

  const progress = useMemo(() => {
    return Math.min(99, Math.round((elapsed / targetMs) * 100));
  }, [elapsed, targetMs]);

  if (!active) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-5 p-5">
        {/* Header: artifact + elapsed */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TypeIcon className="h-4 w-4" />
              <span className="absolute inset-0 animate-ping rounded-xl bg-primary/20 opacity-60" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">
                Evaluating <span className="capitalize">{TYPE_LABELS[artifactType]}</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {consistency === "high" ? "High consistency · 3 samples" : "Fast · 1 sample"}
              </p>
            </div>
          </div>
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
            {formatElapsed(elapsed)}
          </span>
        </div>

        {/* Big rotating-icon stage with cycling phrase */}
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-primary/[0.04] via-card to-card p-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/15" />
              <span className="absolute inset-0 rounded-2xl bg-primary/10" />
              <span
                key={`${stepIdx}-${iconIdx}`}
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-sm ring-1 ring-border",
                  "animate-[fadeUp_300ms_ease-out]",
                )}
              >
                <ActiveIcon className={cn("h-6 w-6", activeIcon.tint)} />
              </span>
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-base font-semibold tracking-tight">{current.label}</p>
              <p
                key={`${stepIdx}-${phraseIdx}`}
                className="animate-[fadeUp_350ms_ease-out] text-sm text-muted-foreground"
              >
                {phrase}
              </p>
              <ThinkingDots />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Step {stepIdx + 1} of {steps.length}
            </span>
            <span className="font-medium tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-sky-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step list */}
        <ul className="space-y-2">
          {steps.map((s, i) => {
            const done = i < stepIdx;
            const isCurrent = i === stepIdx;
            return (
              <li key={s.key} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                    done && "border-emerald-500 bg-emerald-500 text-white",
                    isCurrent && "border-primary text-primary",
                    !done && !isCurrent && "border-border text-muted-foreground",
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="text-[10px] font-medium">{i + 1}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm",
                      done && "text-muted-foreground line-through",
                      isCurrent && "font-medium",
                      !done && !isCurrent && "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>

      {/* Local keyframes (avoid touching globals.css) */}
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Card>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <span
        className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70"
        style={{ animationDelay: "300ms" }}
      />
    </span>
  );
}

function formatElapsed(ms: number): string {
  const s = ms / 1000;
  if (s < 10) return `${s.toFixed(1)}s`;
  return `${Math.floor(s)}s`;
}
