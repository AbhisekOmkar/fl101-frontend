interface BarChartProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  gap?: number;
}

/**
 * Vivid solid-color bar chart — matches the Cloves "Conversion Rate" card.
 * No opacity ramp; every bar is the same hue, only height varies.
 */
export function BarChart({
  data,
  width = 360,
  height = 160,
  className,
  color = "hsl(var(--chart-1))",
  gap = 3,
}: BarChartProps) {
  const points = data.length > 0 ? data : [0];
  const max = Math.max(...points, 1);
  const barWidth = Math.max(2, (width - gap * (points.length - 1)) / points.length);

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      {points.map((v, i) => {
        const h = Math.max(2, (v / max) * (height - 4));
        const x = i * (barWidth + gap);
        const y = height - h;
        return (
          <rect key={i} x={x} y={y} width={barWidth} height={h} rx="2" fill={color} />
        );
      })}
    </svg>
  );
}
