"use client";
import { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  ChevronDown,
  Code2,
  FileText,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ArtifactInput,
  ArtifactType,
  CodeLanguage,
  ConsistencyMode,
} from "@/lib/types";

const TYPES: { value: ArtifactType; label: string; icon: typeof FileText; min: number }[] = [
  { value: "brief", label: "Brief", icon: FileText, min: 50 },
  { value: "draft", label: "Draft", icon: BookOpen, min: 50 },
  { value: "code", label: "Code", icon: Code2, min: 20 },
];

const SAMPLES: Record<ArtifactType, string> = {
  brief:
    "Goal: Cut median time from signup to first 'aha' (a shared dashboard) from 11.2 minutes to under 4 minutes by 2026-07-01.\n\nTarget user: B2B PMs at SaaS companies with 50-500 employees. We interviewed 14 of them in March 2026.\n\nProposal: Skip the database-picker on first run; auto-provision a sample workspace. Replace the 5-step setup wizard with one 'try a sample dashboard' button.\n\nOwners: Maria (PM), Jules (Eng lead), Priya (Design). Acceptance: activation rate > 35% in week-1 cohort.",
  draft:
    "Productivity is very important today. Many people struggle with it. There are lots of tips. For example, you can make a to-do list. You can also block out time. Another tip is to take breaks. Studies show breaks are good. In conclusion, productivity is important and you should try some of these tips.",
  code:
    "from dataclasses import dataclass\nfrom time import monotonic\n\n@dataclass\nclass TokenBucket:\n    capacity: int\n    refill_per_sec: float\n\n    def try_acquire(self, n: int = 1) -> bool:\n        now = monotonic()\n        # ... refill + check\n        return True",
};

interface Props {
  loading: boolean;
  onSubmit: (input: ArtifactInput) => void;
  consistency: ConsistencyMode;
}

export function ChatComposer({ loading, onSubmit, consistency }: Props) {
  const [type, setType] = useState<ArtifactType>("brief");
  const [language, setLanguage] = useState<CodeLanguage>("python");
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
  }, [content]);

  const min = TYPES.find((t) => t.value === type)!.min;
  const tooShort = content.trim().length > 0 && content.trim().length < min;
  const empty = content.trim().length === 0;

  const submit = () => {
    if (loading || empty || tooShort) return;
    onSubmit({
      artifact_type: type,
      content,
      title: null,
      language: type === "code" ? language : null,
      consistency,
    });
    setContent("");
  };

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      {/* Type selector pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b px-3 py-2">
        {TYPES.map((t) => {
          const Icon = t.icon;
          const active = type === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
        {type === "code" && (
          <div className="ml-1 flex items-center gap-1">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
              className="rounded-md border bg-card px-2 py-1 text-xs"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
              <option value="java">Java</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}
        <button
          type="button"
          onClick={() => setContent(SAMPLES[type])}
          className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary"
        >
          <Sparkles className="h-3 w-3" /> Insert sample
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          type === "code"
            ? "Paste a snippet, function, or small module…"
            : "Paste your brief, PRD, essay, or draft here…"
        }
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          }
        }}
        className={cn(
          "block w-full resize-none border-0 bg-transparent px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground",
          type === "code" && "font-mono text-[13px]",
        )}
        style={{ minHeight: 80 }}
      />

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
        <span
          className={cn(
            "text-[11px] tabular-nums",
            tooShort ? "text-amber-600" : "text-muted-foreground",
          )}
        >
          {tooShort
            ? `${content.trim().length}/${min} chars — keep going`
            : `${content.length.toLocaleString()} chars · ⌘+↵ to send`}
        </span>
        <Button
          type="button"
          size="sm"
          onClick={submit}
          disabled={loading || empty || tooShort}
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Evaluating
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" /> Evaluate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function ModeSelector({
  value,
  onChange,
  disabled,
}: {
  value: ConsistencyMode;
  onChange: (v: ConsistencyMode) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-secondary/60 disabled:opacity-50"
      >
        <span className="accent-dot h-2 w-2 rounded-full" />
        {value === "high" ? "High consistency · 3 samples" : "Fast · 1 sample"}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-72 overflow-hidden rounded-xl border bg-popover shadow-lg">
            <ModeOption
              active={value === "high"}
              label="High consistency"
              hint="3 parallel samples · median-aggregated · ~14s · default for reliability"
              onClick={() => {
                onChange("high");
                setOpen(false);
              }}
            />
            <ModeOption
              active={value === "fast"}
              label="Fast"
              hint="1 sample · ~5s · cheaper, higher variance"
              onClick={() => {
                onChange("fast");
                setOpen(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function ModeOption({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full px-4 py-3 text-left transition-colors hover:bg-secondary/60",
        active && "bg-secondary/60",
      )}
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        {label}
        {active && (
          <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
            current
          </span>
        )}
      </p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
        {hint}
      </p>
    </button>
  );
}
