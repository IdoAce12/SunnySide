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
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-500">
          Post-session intelligence
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Performance summary
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={Timer}
          accent="gold"
          label="Exposure time"
          value={`${totals.totalHours.toFixed(1)}h`}
          detail={`${totals.totalMinutes} min total`}
        />
        <Kpi
          icon={Sun}
          accent="gold"
          label="Mean UV index"
          value={totals.sessionCount ? totals.avgUv.toFixed(1) : "—"}
          detail={`${totals.sessionCount} sessions`}
        />
        <Kpi
          icon={Activity}
          accent="ocean"
          label="Cumulative SED"
          value={totals.totalSed.toFixed(2)}
          detail="Standard erythemal dose"
        />
        <Kpi
          icon={Droplets}
          accent="ocean"
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
            <TrendingUp className="size-4 text-sky-500" strokeWidth={2} />
            Session log
          </CardTitle>
          <CardDescription>Structural UV dose &amp; fluid records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length === 0 ? (
            <p className="rounded-2xl border border-stone-200 bg-stone-50/60 px-4 py-8 text-center text-sm text-slate-500">
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
  accent,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  detail: string;
  accent: "gold" | "ocean";
}) {
  const iconColor = accent === "gold" ? "text-amber-500" : "text-sky-500";
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
      <Icon className={`mb-3 size-4 ${iconColor}`} strokeWidth={2} />
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

function SessionRow({ session: s }: { session: CompletedSessionRecord }) {
  const balance =
    s.recommendedMlTotal > 0
      ? Math.round((s.waterMlLogged / s.recommendedMlTotal) * 100)
      : null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">
          {new Date(s.startedAt).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="text-xs text-slate-400">
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
      <div className="mt-2 text-[11px] text-slate-400">
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
      <div className="text-[10px] uppercase tracking-widest text-slate-400">{label}</div>
      <div className="text-sm font-semibold tabular-nums text-slate-800">{value}</div>
      {sub ? <div className="text-[10px] text-slate-400">{sub}</div> : null}
    </div>
  );
}
