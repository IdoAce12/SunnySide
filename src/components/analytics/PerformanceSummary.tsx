"use client";

import * as React from "react";
import {
  Activity,
  Droplets,
  Sun,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { CompletedSessionRecord } from "@/utils/sessionTypes";
import { loadHistory } from "@/utils/storage";
import { getSkinTypeShort, sunscreenLabel } from "@/utils/sunCalc";

export function PerformanceSummary() {
  const [history] = React.useState<CompletedSessionRecord[]>(() => loadHistory());

  const totals = React.useMemo(() => {
    const totalMinutes = history.reduce((a, s) => a + s.durationMinutes, 0);
    const totalMl = history.reduce((a, s) => a + s.waterMlLogged, 0);
    const totalSed = history.reduce((a, s) => a + (s.sedAbsorbed ?? 0), 0);
    const avgUv =
      history.length === 0
        ? 0
        : history.reduce((a, s) => a + s.uvIndexAvg, 0) / history.length;

    const recommendedMl = history.reduce((a, s) => a + (s.recommendedMlTotal ?? 0), 0);
    const fluidBalancePct =
      recommendedMl > 0 ? Math.min(100, Math.round((totalMl / recommendedMl) * 100)) : 0;

    return {
      totalMinutes,
      totalHours: totalMinutes / 60,
      totalMl,
      totalSed: Number(totalSed.toFixed(2)),
      avgUv,
      sessionCount: history.length,
      fluidBalancePct,
      recommendedMl,
    };
  }, [history]);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Post-session intelligence
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Performance summary
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={Timer}
          label="Exposure time"
          value={`${totals.totalHours.toFixed(1)}h`}
          detail={`${totals.totalMinutes} min total`}
        />
        <Kpi
          icon={Sun}
          label="Mean UV index"
          value={totals.sessionCount ? totals.avgUv.toFixed(1) : "—"}
          detail={`${totals.sessionCount} sessions`}
        />
        <Kpi
          icon={Activity}
          label="Cumulative SED"
          value={totals.totalSed.toFixed(2)}
          detail="Standard erythemal dose"
        />
        <Kpi
          icon={Droplets}
          label="Fluid balance"
          value={`${totals.totalMl} mL`}
          detail={
            totals.recommendedMl > 0
              ? `${totals.fluidBalancePct}% of ${totals.recommendedMl} mL target`
              : "No hydration data"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-zinc-500" strokeWidth={1.75} />
            Session log
          </CardTitle>
          <CardDescription>Structural UV dose &amp; fluid records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length === 0 ? (
            <p className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-6 text-center text-sm text-zinc-500">
              Complete a session to generate your performance report.
            </p>
          ) : (
            history.slice(0, 25).map((s) => <SessionRow key={s.id} session={s} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
      <Icon className="mb-3 size-4 text-zinc-500" strokeWidth={1.75} />
      <div className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-zinc-50">
        {value}
      </div>
      <div className="mt-1 text-xs text-zinc-500">{detail}</div>
    </div>
  );
}

function SessionRow({ session: s }: { session: CompletedSessionRecord }) {
  const balance =
    s.recommendedMlTotal > 0
      ? Math.round((s.waterMlLogged / s.recommendedMlTotal) * 100)
      : null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-200">
          {new Date(s.startedAt).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="text-xs text-zinc-500">
          {getSkinTypeShort(s.setup.skinType)} • {sunscreenLabel(s.setup.spf)}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Cell label="Duration" value={`${s.durationMinutes} min`} />
        <Cell label="UV index" value={s.uvIndexAvg.toFixed(1)} />
        <Cell label="SED absorbed" value={(s.sedAbsorbed ?? 0).toFixed(2)} />
        <Cell
          label="Hydration"
          value={`${s.waterMlLogged} mL`}
          sub={balance != null ? `${balance}% of target` : undefined}
        />
      </div>
      <div className="mt-2 text-[11px] text-zinc-600">
        MED {s.medJPerM2 ?? "—"} J/m² • Limit {Math.round(s.safeExposureMinutes ?? 0)} min
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-600">{label}</div>
      <div className="text-sm font-medium tabular-nums text-zinc-200">{value}</div>
      {sub ? <div className="text-[10px] text-zinc-600">{sub}</div> : null}
    </div>
  );
}
