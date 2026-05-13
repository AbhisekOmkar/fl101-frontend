import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatCard({ label, value, hint, icon: Icon, accent }: StatCardProps) {
  return (
    <Card className={cn("transition-colors", accent && "border-accent/30")}>
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border",
            accent && "border-accent/40 bg-accent/10 text-accent",
            !accent && "bg-secondary/60 text-muted-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
