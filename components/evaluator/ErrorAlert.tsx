import { AlertCircle, ShieldAlert, FileWarning } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  errorCode?: string;
  message: string;
  suggested?: string | null;
}

const ICON = {
  ARTIFACT_TYPE_MISMATCH: FileWarning,
  PROMPT_INJECTION_DETECTED: ShieldAlert,
  EMPTY_INPUT: FileWarning,
  ARTIFACT_TOO_LARGE: FileWarning,
} as const;

export function ErrorAlert({ errorCode, message, suggested }: Props) {
  const Icon =
    (errorCode && ICON[errorCode as keyof typeof ICON]) || AlertCircle;
  return (
    <Card className={cn("overflow-hidden border-destructive/30 bg-destructive/[0.03]")}>
      <CardContent className="flex gap-3 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="break-words text-sm font-semibold text-destructive">
            {errorCode || "Error"}
          </p>
          <p className="break-words text-sm text-destructive/85">{message}</p>
          {suggested && (
            <p className="pt-1 text-xs text-destructive/75">
              Suggested type:{" "}
              <span className="font-semibold capitalize">{suggested}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
