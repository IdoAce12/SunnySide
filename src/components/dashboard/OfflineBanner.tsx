"use client";

import { WifiOff } from "lucide-react";
import { cn } from "@/utils/cn";

export function OfflineBanner({
  locationName = "Tel Aviv",
  className,
}: {
  locationName?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm",
        className,
      )}
    >
      <WifiOff className="size-4 shrink-0 text-slate-400" strokeWidth={2} />
      <span>
        Offline Mode — Using cached {locationName} beach data
      </span>
    </div>
  );
}
