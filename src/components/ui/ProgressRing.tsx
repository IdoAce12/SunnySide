"use client";

import { cn } from "@/utils/cn";

export function ProgressRing({
  value,
  size = 160,
  stroke = 6,
  className,
  ringClassName = "text-amber-500",
  trackClassName = "text-stone-200",
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  ringClassName?: string;
  trackClassName?: string;
  label: string;
  sublabel?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-500 ease-out", ringClassName)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
          {label}
        </span>
        {sublabel ? (
          <span className="mt-0.5 text-xs text-slate-400">{sublabel}</span>
        ) : null}
      </div>
    </div>
  );
}
