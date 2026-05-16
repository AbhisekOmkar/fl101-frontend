"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SparkLogo } from "@/components/brand/SparkLogo";
import type { ArtifactType, ConsistencyMode } from "@/lib/types";

interface Props {
  active: boolean;
  artifactType: ArtifactType;
  consistency: ConsistencyMode;
  /** When the response arrives, pass the latency ms to show "Thought for Xs". */
  doneMs?: number | null;
}

const PHASES_BY_TYPE: Record<ArtifactType, string[]> = {
  brief: [
    "Reading the brief",
    "Checking artifact type",
    "Anchoring each dimension to the rubric",
    "Identifying missing gaps",
    "Picking the single next-best step",
  ],
  draft: [
    "Reading the draft",
    "Checking artifact type",
    "Scoring clarity, evidence, voice",
    "Finding weak paragraphs",
    "Picking the single next-best step",
  ],
  code: [
    "Reading the snippet",
    "Checking artifact type",
    "Scoring correctness, clarity, robustness",
    "Flagging missing edge cases",
    "Picking the single next-best step",
  ],
};

export function ThinkingIndicator({
  active,
  artifactType,
  consistency,
  doneMs = null,
}: Props) {
  const phases = PHASES_BY_TYPE[artifactType];
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    if (!active) return;
    setPhaseIdx(0);
    const id = setInterval(() => {
      setPhaseIdx((i) => Math.min(phases.length - 1, i + 1));
    }, consistency === "high" ? 2400 : 1100);
    return () => clearInterval(id);
  }, [active, consistency, phases.length]);

  if (!active && doneMs == null) return null;

  if (!active && doneMs != null) {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <SparkLogo size={11} className="text-foreground" />
        Thought for {(doneMs / 1000).toFixed(1)}s
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Dots />
      <span className="font-medium text-foreground">{phases[phaseIdx]}</span>
      <span className="text-[11px]">
        · {consistency === "high" ? "3 samples in parallel" : "1 sample"}
      </span>
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-muted-foreground/60",
            "animate-bounce",
          )}
          style={{ animationDelay: `${i * 120}ms`, animationDuration: "900ms" }}
        />
      ))}
    </span>
  );
}
