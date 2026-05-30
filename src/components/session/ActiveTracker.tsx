"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Droplets,
  FlipHorizontal2,
  Square,
  Sun,
  Timer,
  TreePalm,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { HealthDisclaimer } from "@/components/ui/HealthDisclaimer";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { formatElapsed, useElapsedTime } from "@/hooks/useElapsedTime";
import { useSessionNotifications } from "@/hooks/useSessionNotifications";
import type { PermissionState } from "@/utils/notifications";
import type { ActiveSessionState } from "@/utils/sessionTypes";
import {
  calculateHydration,
  calculateSafeExposure,
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

  const { supported, permission, enableAlerts, clearSessionAlerts } =
    useSessionNotifications({
      startedAt: active?.startedAt ?? null,
      enabled: !!active && !noExposure,
      safeLimitMinutes: exposure?.safeExposureMinutes ?? 0,
      remainingMinutes: safeLeft,
      flipIntervalMinutes: flipInterval,
    });

  const logWater = (ml: number) => {
    if (!active) return;
    const next = { ...active, waterMlLogged: active.waterMlLogged + ml };
    setActive(next);
    saveActiveSession(next);
  };

  const handleFinishSession = () => {
    if (!active || !exposure || !hydration) return;
    clearSessionAlerts();
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

        <AlertsCard
          supported={supported}
          permission={permission}
          onEnable={enableAlerts}
          flipIntervalMinutes={flipInterval}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Sun className="size-4 text-amber-500" strokeWidth={2} />
                  Your Sun Plan
                </CardTitle>
                {exposure?.capped ? <ShadeBadge /> : null}
              </div>
              <CardDescription>How much longer is comfortable in the sun</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <ProgressRing
                value={progressPct}
                label={noExposure ? "—" : `${Math.round(safeLeft)}`}
                sublabel={noExposure ? "no sun" : "min left"}
                size={168}
                stroke={7}
                ringClassName="text-amber-500"
              />
              <div className="flex-1 space-y-3 text-sm">
                <Row label="Time in sun" value={formatElapsed(elapsedMs)} />
                <Row
                  label="Recommended"
                  value={
                    noExposure ? "Wait for sun" : `${Math.round(exposure!.safeExposureMinutes)} min`
                  }
                />
                <HealthDisclaimer className="!mt-4" />
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
              Stay hydrated
            </CardTitle>
            <CardDescription>
              Aim for about {hydration?.recommendedMl ?? 0} mL of water so far
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <FluidStat label="You drank" value={`${active.waterMlLogged}`} unit="mL" />
              <FluidStat label="Goal" value={`${hydration?.recommendedMl ?? 0}`} unit="mL" />
              <FluidStat
                label="Still need"
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

function ShadeBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
      <TreePalm className="size-3" strokeWidth={2.5} />
      Recommended: Move to Shade Soon
    </span>
  );
}

function AlertsCard({
  supported,
  permission,
  onEnable,
  flipIntervalMinutes,
}: {
  supported: boolean;
  permission: PermissionState;
  onEnable: () => void;
  flipIntervalMinutes: number;
}) {
  const granted = permission === "granted";
  const denied = permission === "denied";

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl",
              granted ? "bg-amber-50 text-amber-500" : "bg-stone-100 text-slate-400",
            )}
          >
            <BellRing className="size-4" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Lock-screen alerts</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {!supported
                ? "This device does not support web notifications."
                : granted
                  ? `On — quiet otherwise. We'll only ping you to flip every ${flipIntervalMinutes} min and when your Sun Plan is complete.`
                  : denied
                    ? "Blocked. Enable notifications for SunnySide in your browser settings."
                    : "Get a flip reminder and a finish alert — even when your phone is locked."}
            </p>
          </div>
        </div>
        {supported && !granted && !denied ? (
          <Button variant="gold" size="sm" onClick={onEnable} className="w-full sm:w-auto">
            Enable alerts
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
