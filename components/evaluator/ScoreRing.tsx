import { scoreColor, scoreLabel } from "@/lib/utils";

interface Props {
  score: number;
  size?: number;
  label?: boolean;
}

export function ScoreRing({ score, size = 128, label = true }: Props) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  const stroke = size * 0.08;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-muted/40"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-accent transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-semibold tabular-nums ${scoreColor(score)}`}>
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            / 10
          </span>
        </div>
      </div>
      {label && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Overall verdict
          </p>
          <p className={`text-2xl font-semibold ${scoreColor(score)}`}>
            {scoreLabel(score)}
          </p>
        </div>
      )}
    </div>
  );
}
