"use client";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Code2, FileText, Sparkles, User } from "lucide-react";
import { ChatComposer, ModeSelector } from "@/components/evaluator/ChatComposer";
import { ResultsPanel } from "@/components/evaluator/ResultsPanel";
import { EvaluationProgress } from "@/components/evaluator/EvaluationProgress";
import { ErrorAlert } from "@/components/evaluator/ErrorAlert";
import { Header } from "@/components/layout/Header";
import { api, ApiException } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  ApiError,
  ArtifactInput,
  ArtifactType,
  ConsistencyMode,
  EvaluationResponse,
} from "@/lib/types";

interface Turn {
  id: string;
  artifact: ArtifactInput;
  result: EvaluationResponse | null;
  error: ApiError | null;
  loading: boolean;
}

const TYPE_META: Record<ArtifactType, { icon: typeof FileText; label: string }> = {
  brief: { icon: FileText, label: "Brief" },
  draft: { icon: BookOpen, label: "Draft" },
  code: { icon: Code2, label: "Code" },
};

export default function EvaluatePage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [consistency, setConsistency] = useState<ConsistencyMode>("high");
  const scrollRef = useRef<HTMLDivElement>(null);

  const loading = turns.some((t) => t.loading);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns]);

  const submit = async (input: ArtifactInput) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    setTurns((prev) => [
      ...prev,
      { id, artifact: input, result: null, error: null, loading: true },
    ]);

    try {
      const r = await api.evaluate(input);
      setTurns((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, result: r, loading: false } : t,
        ),
      );
    } catch (e) {
      const err: ApiError =
        e instanceof ApiException
          ? e.payload
          : {
              error_code: "CLIENT_ERROR",
              message: e instanceof Error ? e.message : "Unknown error",
            };
      setTurns((prev) =>
        prev.map((t) => (t.id === id ? { ...t, error: err, loading: false } : t)),
      );
    }
  };

  const empty = turns.length === 0;

  return (
    <>
      <Header title="Evaluate" />
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Mode selector strip */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-background/85 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mode
            </span>
            <ModeSelector
              value={consistency}
              onChange={setConsistency}
              disabled={loading}
            />
          </div>
          <span className="text-[11px] text-muted-foreground">
            {turns.length} {turns.length === 1 ? "turn" : "turns"} this session
          </span>
        </div>

        {/* Conversation area */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          {empty ? (
            <EmptyHero />
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
              {turns.map((t) => (
                <ConversationTurn key={t.id} turn={t} />
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t bg-background/85 backdrop-blur">
          <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
            <ChatComposer
              loading={loading}
              onSubmit={submit}
              consistency={consistency}
            />
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              fl101 critic returns rubric scores, gaps, and the single next-best step.
              Mode applies to the next message.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function EmptyHero() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Sparkles className="h-6 w-6" />
      </span>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          What do you want me to evaluate?
        </h2>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          Paste a brief, a draft, or a code snippet. I&apos;ll score it against a
          rubric, name the gaps, and give you the single next-best step.
        </p>
      </div>
      <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-3">
        {(["brief", "draft", "code"] as ArtifactType[]).map((t) => {
          const Icon = TYPE_META[t].icon;
          return (
            <div
              key={t}
              className="flex items-start gap-3 rounded-xl border bg-card p-3 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold capitalize">{t}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t === "brief" && "PRD, design doc, plan"}
                  {t === "draft" && "Essay, post, analysis"}
                  {t === "code" && "Function, snippet, module"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConversationTurn({ turn }: { turn: Turn }) {
  const Icon = TYPE_META[turn.artifact.artifact_type].icon;
  const label = TYPE_META[turn.artifact.artifact_type].label;

  return (
    <div className="space-y-4">
      {/* User bubble */}
      <div className="flex justify-end">
        <div className="max-w-[85%] space-y-2">
          <div className="flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
            <span className="capitalize">{label}</span>
            <span>·</span>
            <span>{turn.artifact.consistency} mode</span>
          </div>
          <div className="bubble whitespace-pre-wrap bg-primary text-primary-foreground">
            {turn.artifact.content.length > 800
              ? `${turn.artifact.content.slice(0, 800)}…`
              : turn.artifact.content}
          </div>
        </div>
        <span className="ml-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="h-4 w-4" />
        </span>
      </div>

      {/* Assistant bubble */}
      <div className="flex gap-3">
        <span
          className={cn(
            "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            turn.loading
              ? "bg-accent/30 text-accent-foreground"
              : "bg-accent text-accent-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          {turn.loading && (
            <EvaluationProgress
              active
              artifactType={turn.artifact.artifact_type}
              consistency={turn.artifact.consistency ?? "high"}
            />
          )}
          {turn.error && (
            <ErrorAlert
              errorCode={turn.error.error_code}
              message={turn.error.message}
              suggested={turn.error.suggested_type ?? null}
            />
          )}
          {turn.result && <ResultsPanel result={turn.result} />}
        </div>
      </div>
    </div>
  );
}
