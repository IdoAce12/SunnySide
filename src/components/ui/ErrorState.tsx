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
        "flex flex-col items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-sm",
        className,
      )}
      role="alert"
    >
      <div className="flex items-center gap-2 text-zinc-100">
        <AlertCircle className="size-4 shrink-0 text-amber-600/90" strokeWidth={1.75} />
        <span className="text-sm font-medium tracking-tight">{title}</span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-400">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="size-3.5" strokeWidth={1.75} />
          Retry
        </Button>
      ) : null}
    </div>
  );
}
