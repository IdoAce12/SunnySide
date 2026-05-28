import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export function ErrorState({
  title = "Unable to load data",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5",
        className,
      )}
      role="alert"
    >
      <div className="flex items-center gap-2 text-slate-900">
        <AlertCircle className="size-4 shrink-0 text-amber-500" strokeWidth={2} />
        <span className="text-sm font-medium tracking-tight">{title}</span>
      </div>
      <p className="text-sm leading-relaxed text-slate-500">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="size-3.5" strokeWidth={2} />
          Retry
        </Button>
      ) : null}
    </div>
  );
}
