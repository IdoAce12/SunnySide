"use client";

import { WifiOff } from "lucide-react";
import { cn } from "@/utils/cn";

export function OfflineBanner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-4 py-2.5 text-sm text-zinc-400 backdrop-blur-sm",
        className,
      )}
    >
      <WifiOff className="size-4 shrink-0 text-zinc-500" strokeWidth={1.75} />
      <span>Offline Mode — Using cached Tel Aviv beach data</span>
    </div>
  );
}
