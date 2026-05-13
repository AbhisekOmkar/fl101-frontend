"use client";
import { cn, scoreColor } from "@/lib/utils";
import type { DimensionScore } from "@/lib/types";

interface Props {
  dimensions: DimensionScore[];
}

export function DimensionScores({ dimensions }: Props) {
  return (
    <ul className="space-y-5">
      {dimensions.map((d) => {
        const pct = (d.score / 10) * 100;
        const barColor =
          d.score >= 8
            ? "bg-emerald-500"
            : d.score >= 5
              ? "bg-amber-500"
              : "bg-rose-500";
        return (
          <li key={d.key} className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium">{d.name}</span>
              <span className={cn("shrink-0 text-sm font-semibold tabular-nums", scoreColor(d.score))}>
                {d.score}<span className="text-xs text-muted-foreground">/10</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn("h-full rounded-full transition-all duration-700", barColor)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {d.rationale}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
