import { MessageSquare } from "lucide-react";
import type { FeedbackItem } from "@/lib/types";

interface Props {
  items: FeedbackItem[];
}

export function FeedbackPanel({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No per-dimension feedback (this artifact scored consistently across dimensions).
      </p>
    );
  }
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 rounded-lg border bg-card px-4 py-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <MessageSquare className="h-3 w-3" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {item.dimension}
            </p>
            <p className="text-sm leading-relaxed">{item.feedback}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
