"use client";
import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import { ChatComposer, ModeSelector } from "@/components/evaluator/ChatComposer";
import { ResultsPanel } from "@/components/evaluator/ResultsPanel";
import { ThinkingIndicator } from "@/components/evaluator/ThinkingIndicator";
import { ErrorAlert } from "@/components/evaluator/ErrorAlert";
import { Header } from "@/components/layout/Header";
import { SparkLogo } from "@/components/brand/SparkLogo";
import { api, ApiException } from "@/lib/api";
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
  startedAt: number;
  finishedAt: number | null;
}

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
    const startedAt = Date.now();
    setTurns((prev) => [
      ...prev,
      {
        id,
        artifact: input,
        result: null,
        error: null,
        loading: true,
        startedAt,
        finishedAt: null,
      },
    ]);

    try {
      const r = await api.evaluate(input);
      setTurns((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, result: r, loading: false, finishedAt: Date.now() }
            : t,
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
        prev.map((t) =>
          t.id === id
            ? { ...t, error: err, loading: false, finishedAt: Date.now() }
            : t,
        ),
      );
    }
  };

  const empty = turns.length === 0;

  return (
    <>
      <Header title="Evaluate" />
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Mode strip */}
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

        {/* Conversation */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          {empty ? (
            <EmptyHero />
          ) : (
            <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6 sm:px-6">
              {turns.map((t) => (
                <ConversationTurn key={t.id} turn={t} />
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t bg-background/85 backdrop-blur">
          <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6">
            <ChatComposer
              loading={loading}
              onSubmit={submit}
              consistency={consistency}
            />
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              The critic returns rubric scores, gaps, and the single next-best step.
              Mode applies to the next message.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function AgentAvatar({ pulse = false }: { pulse?: boolean }) {
  return (
    <span className="relative mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-card text-foreground shadow-sm">
      <SparkLogo size={18} />
      {pulse && (
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
      )}
    </span>
  );
}

function EmptyHero() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border bg-card text-foreground shadow-sm">
        <SparkLogo size={26} />
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
        <ExampleChip
          title="Evaluate a PRD"
          hint="Paste a product brief or design doc"
        />
        <ExampleChip
          title="Score a draft"
          hint="Essay, post, written analysis"
        />
        <ExampleChip
          title="Review a snippet"
          hint="Function, module, code change"
        />
      </div>
    </div>
  );
}

function ExampleChip({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 text-left">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function ConversationTurn({ turn }: { turn: Turn }) {
  const elapsed =
    turn.finishedAt != null ? turn.finishedAt - turn.startedAt : null;

  return (
    <div className="space-y-4">
      {/* User bubble (right) */}
      <div className="flex justify-end gap-3">
        <div className="max-w-[80%] space-y-1.5">
          <div className="flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
            <span className="capitalize">{turn.artifact.artifact_type}</span>
            <span>·</span>
            <span>{turn.artifact.consistency} mode</span>
          </div>
          <div className="rounded-2xl bg-accent/30 px-4 py-3 text-sm leading-relaxed text-foreground">
            <pre className="whitespace-pre-wrap font-sans">
              {turn.artifact.content.length > 800
                ? `${turn.artifact.content.slice(0, 800)}…`
                : turn.artifact.content}
            </pre>
          </div>
        </div>
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="h-4 w-4 text-muted-foreground" />
        </span>
      </div>

      {/* Agent bubble (left) */}
      <div className="flex gap-3">
        <AgentAvatar pulse={turn.loading} />
        <div className="min-w-0 flex-1 space-y-3">
          {turn.loading && (
            <ThinkingIndicator
              active
              artifactType={turn.artifact.artifact_type}
              consistency={turn.artifact.consistency ?? "high"}
            />
          )}
          {!turn.loading && elapsed != null && (
            <ThinkingIndicator
              active={false}
              artifactType={turn.artifact.artifact_type}
              consistency={turn.artifact.consistency ?? "high"}
              doneMs={elapsed}
            />
          )}
          {turn.error && (
            <ErrorAlert
              errorCode={turn.error.error_code}
              message={turn.error.message}
              suggested={turn.error.suggested_type ?? null}
            />
          )}
          {turn.result && <ResultsPanel result={turn.result} compact />}
        </div>
      </div>
    </div>
  );
}
