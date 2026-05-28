import { cn } from "@/utils/cn";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-zinc-800/80",
        className,
      )}
      {...props}
    />
  );
}

export function MetricSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-sm">
      <Skeleton className="mb-3 h-3 w-16" />
      <Skeleton className="h-7 w-24" />
    </div>
  );
}

export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <MetricSkeleton key={i} />
      ))}
    </div>
  );
}
