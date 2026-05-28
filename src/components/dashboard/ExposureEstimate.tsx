"use client";

import { Activity } from "lucide-react";
import type { SunCalcResult } from "@/utils/sunCalc";
import { getSkinTypeShort, sunscreenLabel } from "@/utils/sunCalc";
import type { FitzpatrickSkinType, SunscreenChoice } from "@/utils/sunCalc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

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
          <Activity className="size-4 text-amber-600/80" strokeWidth={1.75} />
          MED exposure budget
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
          className={
            calc.noExposure
              ? "rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-4"
              : "rounded-lg border border-amber-900/30 bg-amber-950/20 px-4 py-4"
          }
        >
          <div
            className={
              calc.noExposure
                ? "text-[10px] font-medium uppercase tracking-widest text-zinc-500"
                : "text-[10px] font-medium uppercase tracking-widest text-amber-700/80"
            }
          >
            {calc.noExposure ? "Exposure status" : "Safe limit at current UV"}
          </div>
          <div className="mt-1 text-3xl font-semibold tracking-tight text-zinc-50">
            {calc.noExposure ? (
              "No exposure"
            ) : (
              <>
                {Math.round(calc.safeExposureMinutes)}
                <span className="ml-1 text-lg font-normal text-zinc-500">min</span>
              </>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            {calc.noExposure
              ? "UV is zero, unavailable, or you are offline. Sunbathing is not possible."
              : `Erythemally weighted irradiance ${(calc.uvIrradianceWPerM2 * 1000).toFixed(1)} mW/m² • Transmission ${(calc.spfTransmission * 100).toFixed(0)}%`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-zinc-600">{label}</div>
      <div className="mt-0.5 font-medium tabular-nums text-zinc-200">{value}</div>
    </div>
  );
}
