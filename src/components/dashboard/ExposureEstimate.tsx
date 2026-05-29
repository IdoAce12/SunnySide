"use client";

import { Sun, TreePalm } from "lucide-react";
import type { SunCalcResult } from "@/utils/sunCalc";
import { sunscreenLabel, uvLevelWord } from "@/utils/sunCalc";
import type { FitzpatrickSkinType, SunscreenChoice } from "@/utils/sunCalc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

export function ExposureEstimate({
  skinType,
  spf,
  uvIndex,
  calc,
}: {
  skinType: FitzpatrickSkinType;
  spf: SunscreenChoice;
  uvIndex: number;
  calc: SunCalcResult;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="size-4 text-amber-500" strokeWidth={2} />
          Your Sun Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "rounded-2xl border px-5 py-5",
            calc.noExposure
              ? "border-slate-200 bg-slate-50"
              : "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div
              className={cn(
                "text-[11px] font-semibold uppercase tracking-widest",
                calc.noExposure ? "text-slate-400" : "text-amber-600",
              )}
            >
              {calc.noExposure ? "Not right now" : "Recommended time in the sun"}
            </div>
            {!calc.noExposure && calc.capped ? <ShadeBadge /> : null}
          </div>

          <div className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">
            {calc.noExposure ? (
              "Wait for sun"
            ) : (
              <>
                {Math.round(calc.safeExposureMinutes)}
                <span className="ml-1.5 text-xl font-normal text-slate-400">min</span>
              </>
            )}
          </div>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {calc.noExposure
              ? "There is no sun to bathe in right now — check back when it rises."
              : calc.capped
                ? "We've capped your session to keep your skin safe in this strong sun."
                : `A comfortable plan for your skin with ${sunscreenLabel(spf)} sunscreen.`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <Chip label="Your skin" value={`Type ${skinType}`} />
          <Chip label="Sunscreen" value={sunscreenLabel(spf)} />
          <Chip label="Sun power" value={uvLevelWord(uvIndex)} />
        </div>
      </CardContent>
    </Card>
  );
}

function ShadeBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
      <TreePalm className="size-3" strokeWidth={2.5} />
      Move to Shade Soon
    </span>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}
