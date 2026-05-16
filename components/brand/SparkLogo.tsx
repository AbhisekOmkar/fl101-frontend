import { cn } from "@/lib/utils";

interface Props {
  size?: number;
  className?: string;
  /** When true, draws a thin contrast ring (used as an avatar). */
  framed?: boolean;
}

/**
 * fl101 brand mark — a clean 4-point spark/star.
 * Uses currentColor so a parent can tint it.
 */
export function SparkLogo({ size = 16, className, framed = false }: Props) {
  const svg = (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1.2c.4 0 .8.3.9.7l1.6 6.5c.1.4.4.7.8.8l6.5 1.6c.4.1.7.5.7.9s-.3.8-.7.9l-6.5 1.6c-.4.1-.7.4-.8.8l-1.6 6.5c-.1.4-.5.7-.9.7s-.8-.3-.9-.7l-1.6-6.5c-.1-.4-.4-.7-.8-.8l-6.5-1.6c-.4-.1-.7-.5-.7-.9s.3-.8.7-.9l6.5-1.6c.4-.1.7-.4.8-.8l1.6-6.5c.1-.4.5-.7.9-.7z" />
    </svg>
  );

  if (!framed) return <span className={className}>{svg}</span>;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border bg-card shadow-sm",
        className,
      )}
      style={{ width: size + 14, height: size + 14 }}
    >
      {svg}
    </span>
  );
}
