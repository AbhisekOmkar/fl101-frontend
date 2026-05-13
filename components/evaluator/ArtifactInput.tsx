"use client";
import { useState } from "react";
import { FileText, Code2, BookOpen, Wand2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  ArtifactInput as ArtifactInputType,
  ArtifactType,
  CodeLanguage,
  ConsistencyMode,
} from "@/lib/types";

const TYPES: { value: ArtifactType; label: string; icon: typeof FileText; hint: string }[] = [
  { value: "brief", label: "Brief", icon: FileText, hint: "Product brief, PRD, design doc (min 50 chars)." },
  { value: "draft", label: "Draft", icon: BookOpen, hint: "Essay, blog post, written analysis (min 50 chars)." },
  { value: "code", label: "Code", icon: Code2, hint: "Function, snippet, small module (min 20 chars)." },
];

const SAMPLES: Record<ArtifactType, { title: string; content: string }> = {
  brief: {
    title: "Sample: onboarding revamp",
    content:
      "Goal: Cut median time from signup to first 'aha' (a shared dashboard) from 11.2 minutes to under 4 minutes by 2026-07-01.\n\nTarget user: B2B PMs at SaaS companies with 50-500 employees. We interviewed 14 of them in March 2026.\n\nProposal: Skip the database-picker on first run; auto-provision a sample workspace. Replace the 5-step setup wizard with one 'try a sample dashboard' button.\n\nNon-goals: We are NOT redesigning the empty state for invited collaborators.\n\nOwners: Maria (PM), Jules (Eng lead), Priya (Design). Acceptance: activation rate > 35% in week-1 cohort.",
  },
  draft: {
    title: "Sample: short essay",
    content:
      "Productivity is very important today. Many people struggle with it. There are lots of tips. For example, you can make a to-do list. You can also block out time. Another tip is to take breaks. Studies show breaks are good. In conclusion, productivity is important and you should try some of these tips.",
  },
  code: {
    title: "Sample: rate limiter",
    content:
      "from dataclasses import dataclass\nfrom time import monotonic\n\n@dataclass\nclass TokenBucket:\n    capacity: int\n    refill_per_sec: float\n\n    def try_acquire(self, n: int = 1) -> bool:\n        now = monotonic()\n        # ... refill + check\n        return True",
  },
};

interface Props {
  loading: boolean;
  onSubmit: (input: ArtifactInputType) => void;
}

export function ArtifactInputForm({ loading, onSubmit }: Props) {
  const [type, setType] = useState<ArtifactType>("brief");
  const [language, setLanguage] = useState<CodeLanguage>("python");
  const [consistency, setConsistency] = useState<ConsistencyMode>("high");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const meta = TYPES.find((t) => t.value === type)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      artifact_type: type,
      content,
      title: title || null,
      language: type === "code" ? language : null,
      consistency,
    });
  };

  const tooShort =
    content.trim().length > 0 &&
    content.trim().length < (type === "code" ? 20 : 50);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wand2 className="h-3.5 w-3.5" />
          </span>
          Submit an artifact
        </CardTitle>
        <CardDescription>
          Rubric score · missing gaps · the single next-best step.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Type picker — custom row of cards (cleaner than tabs at this width) */}
        <div className="space-y-2">
          <Label>Artifact type</Label>
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const active = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-all",
                    active
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="title"
              placeholder="e.g. Onboarding revamp brief v2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="content">Content</Label>
              <button
                type="button"
                className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                onClick={() => {
                  setTitle(SAMPLES[type].title);
                  setContent(SAMPLES[type].content);
                }}
              >
                Insert sample
              </button>
            </div>
            <Textarea
              id="content"
              placeholder={meta.hint}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={cn(
                "font-mono text-[13px] leading-relaxed",
                type === "code" ? "min-h-[260px]" : "min-h-[200px]",
              )}
            />
            <div className="flex items-center justify-between gap-2 text-xs">
              <span
                className={cn(
                  "truncate",
                  tooShort ? "text-amber-600" : "text-muted-foreground",
                )}
              >
                {tooShort
                  ? `Too short — need ${type === "code" ? 20 : 50}+ chars`
                  : meta.hint}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {content.length.toLocaleString()} chars
              </span>
            </div>
          </div>

          <div className={cn("grid gap-3", type === "code" ? "sm:grid-cols-2" : "sm:grid-cols-1")}>
            {type === "code" && (
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={(v) => setLanguage(v as CodeLanguage)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select
                value={consistency}
                onValueChange={(v) => setConsistency(v as ConsistencyMode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High consistency (3 samples · default)</SelectItem>
                  <SelectItem value="fast">Fast (1 sample · cheaper)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading || content.trim().length === 0 || tooShort}
            className={cn(
              "w-full",
              // Keep the loading state vivid: override the disabled opacity that
              // was making the button look lavender/washed-out.
              loading &&
                "disabled:bg-primary disabled:text-primary-foreground disabled:opacity-100",
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Evaluating</span>
                <LoadingDots />
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Evaluate artifact
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 -ml-1">
      <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-current" style={{ animationDelay: "0ms" }} />
      <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-current" style={{ animationDelay: "120ms" }} />
      <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-current" style={{ animationDelay: "240ms" }} />
    </span>
  );
}
