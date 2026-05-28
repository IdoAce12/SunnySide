"use client";

import { Activity, ShieldCheck } from "lucide-react";
import type { SunCalcResult } from "@/utils/sunCalc";
import { getSkinTypeShort, sunscreenLabel } from "@/utils/sunCalc";
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
          <Activity className="size-4 text-amber-500" strokeWidth={2} />
          Safe exposure budget
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <Stat label="Phototype" value={getSkinTypeShort(skinType)} />
          <Stat label="MED" value={`${calc.medJPerM2} J/m²`} />
          <Stat label="SPF" value={sunscreenLabel(spf)} />
          <Stat label="UV Index" value={uvIndex.toFixed(1)} />
        </div>
        <div
          className={cn(
            "rounded-2xl border px-4 py-4",
            calc.noExposure
              ? "border-slate-200 bg-slate-50"
              : "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div
              className={cn(
                "text-[10px] font-semibold uppercase tracking-widest",
                calc.noExposure ? "text-slate-400" : "text-amber-600",
              )}
            >
              {calc.noExposure ? "Exposure status" : "Safe limit at current UV"}
            </div>
            {!calc.noExposure && calc.capped ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-700">
                <ShieldCheck className="size-2.5" strokeWidth={2.5} />
                Max Safe Session Reached
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            {calc.noExposure ? (
              "No exposure"
            ) : (
              <>
                {Math.round(calc.safeExposureMinutes)}
                <span className="ml-1 text-lg font-normal text-slate-400">min</span>
              </>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            {calc.noExposure
              ? "UV is zero or unavailable. Sunbathing is not possible right now."
              : calc.capped
                ? `Formula returned ${calc.rawExposureMinutes} min — truncated to a strict ${calc.hardCapMinutes} min cap for safety.`
                : `Erythemally weighted irradiance ${(calc.uvIrradianceWPerM2 * 1000).toFixed(1)} mW/m² • Transmission ${(calc.spfTransmission * 100).toFixed(0)}%`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-0.5 font-semibold tabular-nums text-slate-800">{value}</div>
    </div>
  );
}
