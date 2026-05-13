import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground ring-border",
        accent: "bg-accent/10 text-accent border-transparent ring-accent/30",
        outline: "text-foreground border-border bg-transparent",
        muted: "bg-muted text-muted-foreground ring-border",
        destructive: "bg-destructive/10 text-destructive ring-destructive/30 border-transparent",
        warning: "border-transparent bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-200",
        primary: "border-transparent bg-primary/10 text-primary ring-primary/20",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
