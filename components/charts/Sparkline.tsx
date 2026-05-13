interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
}

/**
 * Smoothed line chart with a vivid gradient fill — matches the Cloves spec.
 */
export function Sparkline({
  data,
  width = 180,
  height = 64,
  className,
  color = "hsl(var(--chart-1))",
  fill = true,
  strokeWidth = 2.25,
}: SparklineProps) {
  const points = data.length > 0 ? data.slice() : [0];
  if (points.length === 1) points.push(points[0]);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const padY = 6;
  const stepX = width / (points.length - 1);

  const xy = points.map(
    (v, i) =>
      [i * stepX, height - ((v - min) / span) * (height - padY * 2) - padY] as const,
  );

  // Catmull-Rom-ish smoothing using quadratic curves
  let d = `M${xy[0][0].toFixed(2)},${xy[0][1].toFixed(2)}`;
  for (let i = 1; i < xy.length; i++) {
    const [px, py] = xy[i - 1];
    const [x, y] = xy[i];
    const mx = (px + x) / 2;
    d += ` Q${px.toFixed(2)},${py.toFixed(2)} ${mx.toFixed(2)},${((py + y) / 2).toFixed(2)}`;
    if (i === xy.length - 1) d += ` T${x.toFixed(2)},${y.toFixed(2)}`;
  }

  const areaPath = `${d} L${width},${height} L0,${height} Z`;
  const gradId = `spark-grad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="60%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={areaPath} fill={`url(#${gradId})`} />}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
