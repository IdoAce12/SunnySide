"use client";

import { CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export function NetworkErrorCard({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-stone-200/80 bg-white px-6 py-10 text-center shadow-sm",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-sky-50 text-sky-500">
        <CloudOff className="size-7" strokeWidth={1.75} />
      </span>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          Network Connection Required
        </h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-500">
          Please connect to the internet to fetch real-time UV metrics.
        </p>
      </div>
      {onRetry ? (
        <Button variant="gold" size="sm" onClick={onRetry}>
          <RefreshCw className="size-3.5" strokeWidth={2} />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
