import { Rocket, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { NextStep } from "@/lib/types";

interface Props {
  step: NextStep;
}

export function NextStepCard({ step }: Props) {
  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-card shadow-sm">
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <CardContent className="relative p-6 lg:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Rocket className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Next best step
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                ~{step.estimated_effort_minutes} min
              </span>
            </div>
            <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
              {step.action}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {step.rationale}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
