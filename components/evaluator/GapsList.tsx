"use client";
import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gap } from "@/lib/types";

interface Props {
  gaps: Gap[];
}

const SEVERITY_STYLES: Record<Gap["severity"], { dot: string; pill: string; icon: string }> = {
  high: {
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-700 ring-rose-200",
    icon: "text-rose-500",
  },
  medium: {
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: "text-amber-500",
  },
  low: {
    dot: "bg-zinc-400",
    pill: "bg-secondary text-muted-foreground ring-border",
    icon: "text-muted-foreground",
  },
};

export function GapsList({ gaps }: Props) {
  const [open, setOpen] = useState<number | null>(0);
  if (gaps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No gaps flagged — strong artifact.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {gaps.map((g, i) => {
        const isOpen = open === i;
        const sev = SEVERITY_STYLES[g.severity];
        return (
          <li
            key={i}
            className={cn(
              "overflow-hidden rounded-lg border bg-card transition-colors",
              isOpen && "border-primary/30",
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <AlertTriangle className={cn("h-4 w-4 shrink-0", sev.icon)} />
                <span className="truncate text-sm font-medium">{g.title}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
                    sev.pill,
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", sev.dot)} />
                  {g.severity}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </span>
            </button>
            {isOpen && (
              <div className="border-t bg-secondary/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                {g.why}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
