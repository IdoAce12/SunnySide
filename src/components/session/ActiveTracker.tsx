"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Droplets,
  FlipHorizontal2,
  Shield,
  Square,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { formatElapsed, useElapsedTime } from "@/hooks/useElapsedTime";
import type { ActiveSessionState } from "@/utils/sessionTypes";
import {
  calculateHydration,
  calculateSafeExposure,
  calculateSedAbsorbed,
  remainingSafeMinutes,
  safeExposureProgressPercent,
  sunscreenLabel,
} from "@/utils/sunCalc";
import { finalizeSession } from "@/utils/finalizeSession";
import { loadActiveSession, saveActiveSession } from "@/utils/storage";
import { cn } from "@/utils/cn";

export function ActiveTracker() {
  const router = useRouter();
  const [active, setActive] = React.useState<ActiveSessionState | null>(() =>
    loadActiveSession(),
  );
  const [flipAlert, setFlipAlert] = React.useState(false);
  const lastFlipMark = React.useRef(0);

  const { elapsedMs, elapsedMinutes, sync } = useElapsedTime({
    startTime: active?.startedAt ?? null,
    tickMs: 1000,
  });

  const uvIndex = active?.weatherAtStart.uvIndex ?? 0;
  const exposure = active
    ? calculateSafeExposure({
        skinType: active.setup.skinType,
        spf: active.setup.spf,
        uvIndex,
      })
    : null;

  const noExposure = exposure?.noExposure ?? true;
  const safeLeft = exposure
    ? remainingSafeMinutes(exposure.safeExposureMinutes, elapsedMinutes, noExposure)
    : 0;
  const progressPct = exposure
    ? safeExposureProgressPercent(exposure.safeExposureMinutes, elapsedMinutes, noExposure)
    : 0;

  const flipInterval = active?.flipIntervalMinutes ?? 15;
  const flipElapsed = elapsedMinutes % flipInterval;
  const flipRemaining = flipInterval - flipElapsed;
  const flipProgressPct = (flipElapsed / flipInterval) * 100;

  React.useEffect(() => {
    if (!active || elapsedMinutes === 0) return;
    const flipMark = Math.floor(elapsedMinutes / flipInterval);
    if (flipMark > lastFlipMark.current) {
      lastFlipMark.current = flipMark;
      setFlipAlert(true);
      sync();
      const t = window.setTimeout(() => setFlipAlert(false), 10_000);
      return () => window.clearTimeout(t);
    }
  }, [active, elapsedMinutes, flipInterval, sync]);

  const hydration = active
    ? calculateHydration({
        elapsedMinutes,
        airTempC: active.weatherAtStart.airTempC,
        uvIndex,
        waterMlLogged: active.waterMlLogged,
      })
    : null;

  const logWater = (ml: number) => {
    if (!active) return;
    const next = { ...active, waterMlLogged: active.waterMlLogged + ml };
    setActive(next);
    saveActiveSession(next);
  };

  const handleFinishSession = () => {
    if (!active || !exposure || !hydration) return;
    void finalizeSession({ active, exposure, hydration, uvIndex }).then(() => {
      setActive(null);
      router.push("/analytics");
    });
  };

  if (!active) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Active tracker
          </h1>
          <p className="mt-1 text-sm text-slate-500">No session in progress.</p>
        </header>
        <Card>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Start a session from the beach dashboard to begin precision tracking.
            </p>
            <Link href="/">
              <Button variant="secondary">Beach dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Tracker error">
      <div className="space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-500">
              Live session
            </p>
            <h1 className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
              {formatElapsed(elapsedMs)}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {sunscreenLabel(active.setup.spf)} • UV {uvIndex.toFixed(1)} • Type{" "}
              {active.setup.skinType}
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={handleFinishSession}>
            <Square className="size-3.5" strokeWidth={2} />
            End session
          </Button>
        </header>

        {flipAlert ? (
          <div
            className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
            role="status"
          >
            <FlipHorizontal2 className="size-4 text-amber-500" strokeWidth={2} />
            <div>
              <p className="text-sm font-semibold text-slate-900">Flip interval reached</p>
              <p className="text-xs text-slate-500">Rotate exposure surface — front / back.</p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-4 text-amber-500" strokeWidth={2} />
                Exposure budget
              </CardTitle>
              <CardDescription>MED-based safe limit remaining</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <ProgressRing
                value={progressPct}
                label={noExposure ? "—" : `${Math.round(safeLeft)}`}
                sublabel={noExposure ? "no exposure" : "min left"}
                size={168}
                stroke={7}
                ringClassName="text-amber-500"
              />
              <div className="flex-1 space-y-3 text-sm">
                <Row label="Total elapsed" value={formatElapsed(elapsedMs)} />
                <Row
                  label="Safe limit"
                  value={
                    noExposure ? "No exposure" : `${Math.round(exposure!.safeExposureMinutes)} min`
                  }
                />
                <Row label="SED rate" value={`${exposure!.sedPerMinute.toFixed(3)} /min`} />
                <Row
                  label="Absorbed (est.)"
                  value={`${calculateSedAbsorbed(exposure!.sedPerMinute, elapsedMinutes).toFixed(2)} SED`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="size-4 text-sky-500" strokeWidth={2} />
                Flip cycle
              </CardTitle>
              <CardDescription>{flipInterval}-minute bilateral rotation</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
              <ProgressRing
                value={100 - flipProgressPct}
                label={`${flipRemaining}`}
                sublabel="min to flip"
                size={140}
                stroke={6}
                ringClassName="text-sky-500"
              />
              <div className="flex-1 space-y-3 text-sm">
                <Row label="Cycle position" value={`${flipElapsed} / ${flipInterval} min`} />
                <Row label="Started" value={new Date(active.startedAt).toLocaleTimeString()} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="size-4 text-sky-500" strokeWidth={2} />
              Fluid balance
            </CardTitle>
            <CardDescription>
              Modelled loss {hydration?.fluidLossRateMlPerHour ?? 0} mL/h • Target{" "}
              {hydration?.recommendedMl ?? 0} mL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <FluidStat label="Logged" value={`${active.waterMlLogged}`} unit="mL" />
              <FluidStat label="Target" value={`${hydration?.recommendedMl ?? 0}`} unit="mL" />
              <FluidStat
                label="Deficit"
                value={`${hydration?.deficitMl ?? 0}`}
                unit="mL"
                warn={(hydration?.deficitMl ?? 0) > 100}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[250, 500].map((ml) => (
                <Button
                  key={ml}
                  variant="ocean"
                  size="sm"
                  onClick={() => logWater(ml)}
                  className="flex-1 sm:flex-none"
                >
                  +{ml} mL
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-stone-100 pb-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold tabular-nums text-slate-800">{value}</span>
    </div>
  );
}

function FluidStat({
  label,
  value,
  unit,
  warn = false,
}: {
  label: string;
  value: string;
  unit: string;
  warn?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-sky-100 bg-sky-50/40 px-4 py-3",
        warn && "border-amber-200 bg-amber-50/60",
      )}
    >
      <div className="text-[10px] uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
        {value}
        <span className="ml-1 text-xs font-normal text-slate-400">{unit}</span>
      </div>
    </div>
  );
}
