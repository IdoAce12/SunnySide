import { cn } from "@/utils/cn";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-stone-200/70", className)}
      {...props}
    />
  );
}

export function MetricSkeleton() {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
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
