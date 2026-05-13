"use client";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "guard", label: "Guarding input", detail: "Type check, injection scan" },
  { key: "score", label: "Scoring dimensions", detail: "Rubric-anchored critic pass" },
  { key: "aggregate", label: "Aggregating samples", detail: "Median per dimension" },
  { key: "next", label: "Picking next-best step", detail: "The single highest-leverage move" },
];

interface Props {
  active: boolean;
}

/**
 * Faux multi-step loading indicator. Backend is non-streaming, but exposing
 * the pipeline visually makes the system feel like a system, not a black box.
 */
export function StepIndicator({ active }: Props) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!active) {
      setIdx(0);
      return;
    }
    setIdx(0);
    const id = setInterval(() => {
      setIdx((i) => Math.min(STEPS.length - 1, i + 1));
    }, 1400);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <ul className="space-y-3">
          {STEPS.map((s, i) => {
            const done = i < idx;
            const current = i === idx;
            return (
              <li key={s.key} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    done && "border-primary bg-primary text-primary-foreground",
                    current && "border-primary text-primary",
                    !done && !current && "border-border text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : current ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="text-[10px] font-medium">{i + 1}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p
                    className={cn(
                      "text-sm",
                      done && "text-muted-foreground line-through",
                      current && "font-medium",
                      !done && !current && "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
