"use client";
import { useMemo } from "react";

/**
 * Animated backdrop for the login page.
 * - Floating rubric "pills" drift across the canvas (clarity 9.2, evidence 7.4, etc.)
 * - Subtle dotted grid + radial gradient
 * - Pure CSS — no framer-motion dep
 */
export function AuthCanvas() {
  const pills = useMemo(() => generatePills(), []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft radial gradient backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--accent)/0.18),transparent_55%),radial-gradient(circle_at_80%_70%,hsl(var(--accent)/0.10),transparent_55%)]" />

      {/* Dotted grid */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--muted-foreground) / 0.18) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Floating rubric pills */}
      {pills.map((p, i) => (
        <span
          key={i}
          className="absolute inline-flex items-center gap-1.5 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            animation: `drift-${i % 3} ${p.duration}s ease-in-out ${p.delay}s infinite`,
            opacity: 0.85,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-muted-foreground">{p.label}</span>
          <span className="tabular-nums">{p.score.toFixed(1)}</span>
        </span>
      ))}

      <style jsx>{`
        @keyframes drift-0 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(8px, -14px, 0); }
        }
        @keyframes drift-1 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(-12px, 10px, 0); }
        }
        @keyframes drift-2 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(14px, 6px, 0); }
        }
      `}</style>
    </div>
  );
}

interface Pill {
  label: string;
  score: number;
  top: number;
  left: number;
  duration: number;
  delay: number;
  color: string;
}

function generatePills(): Pill[] {
  // Rubric dimensions across brief / draft / code, sampled to feel cohesive.
  const dims: { label: string; score: number }[] = [
    { label: "Clarity",      score: 9.2 },
    { label: "Structure",    score: 7.8 },
    { label: "Evidence",     score: 6.4 },
    { label: "Specificity",  score: 8.5 },
    { label: "Actionability",score: 7.1 },
    { label: "Voice",        score: 6.9 },
    { label: "Argument",     score: 8.2 },
    { label: "Correctness",  score: 9.0 },
    { label: "Robustness",   score: 5.8 },
    { label: "Readability",  score: 8.7 },
    { label: "Coverage",     score: 7.5 },
    { label: "Calibration",  score: 8.9 },
  ];
  const colors = [
    "hsl(var(--accent))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-5))",
  ];
  return dims.map((d, i) => ({
    ...d,
    top: 8 + ((i * 73) % 84),
    left: 5 + ((i * 41) % 88),
    duration: 6 + ((i * 7) % 6),
    delay: (i % 5) * 0.8,
    color: colors[i % colors.length],
  }));
}
