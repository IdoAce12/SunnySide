import { ShieldCheck } from "lucide-react";
import { MOH_DISCLAIMER_TEXT } from "@/utils/healthGuidelines";
import { cn } from "@/utils/cn";

/** Official-source disclaimer (Ministry of Health) — RTL Hebrew, minimalist. */
export function HealthDisclaimer({ className }: { className?: string }) {
  return (
    <div
      dir="rtl"
      className={cn(
        "flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2",
        className,
      )}
    >
      <ShieldCheck
        className="mt-0.5 size-3.5 shrink-0 text-emerald-600"
        strokeWidth={2}
        aria-hidden
      />
      <p className="text-right text-[11px] leading-relaxed text-slate-600">
        {MOH_DISCLAIMER_TEXT}
      </p>
    </div>
  );
}
