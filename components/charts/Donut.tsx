interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

/**
 * Pure-SVG donut chart. Renders each segment as a stroke-dasharray arc.
 */
export function Donut({
  segments,
  size = 220,
  thickness = 28,
  centerLabel = "Total",
  centerValue,
}: DonutProps) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;

  let offset = 0;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={thickness}
          fill="none"
        />
        {segments.map((s, i) => {
          const len = (s.value / total) * circumference;
          const dash = `${len} ${circumference - len}`;
          const arc = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              stroke={s.color}
              strokeWidth={thickness}
              fill="none"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return arc;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {centerLabel}
        </span>
        <span className="text-2xl font-semibold tabular-nums">
          {centerValue ?? total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
