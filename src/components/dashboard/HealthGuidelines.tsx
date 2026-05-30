"use client";

import { AlertTriangle, Sun } from "lucide-react";
import {
  MOH_PEAK_HOURS_TEXT,
  MOH_UV_PROTECTION_TEXT,
  isPeakSunHours,
  requiresFullProtection,
} from "@/utils/healthGuidelines";
import { cn } from "@/utils/cn";

interface HealthGuidelinesProps {
  localHour: number | null;
  uvIndex: number;
}

/** Ministry of Health alert banners — peak hours and high-UV protection. */
export function HealthGuidelines({ localHour, uvIndex }: HealthGuidelinesProps) {
  const peak = isPeakSunHours(localHour);
  const fullProtection = requiresFullProtection(uvIndex);

  if (!peak && !fullProtection) return null;

  return (
    <div className="space-y-3">
      {peak ? <GuidelineBanner tone="amber" icon={Sun} text={MOH_PEAK_HOURS_TEXT} /> : null}
      {fullProtection ? (
        <GuidelineBanner tone="rose" icon={AlertTriangle} text={MOH_UV_PROTECTION_TEXT} />
      ) : null}
    </div>
  );
}

function GuidelineBanner({
  tone,
  icon: Icon,
  text,
}: {
  tone: "amber" | "rose";
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  text: string;
}) {
  const styles =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-rose-200 bg-rose-50 text-rose-900";
  const iconColor = tone === "amber" ? "text-amber-500" : "text-rose-500";

  return (
    <div
      dir="rtl"
      role="alert"
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm",
        styles,
      )}
    >
      <Icon className={cn("size-5 shrink-0", iconColor)} strokeWidth={2} />
      <p className="text-right text-sm font-medium leading-relaxed">{text}</p>
    </div>
  );
}
