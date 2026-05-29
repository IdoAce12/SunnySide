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
import { sunscreenLabel, uvLevelWord } from "@/utils/sunCalc";

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
          Your beach history
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Time in the sun
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={Timer}
          accent="gold"
          label="Time in sun"
          value={`${totals.totalHours.toFixed(1)}h`}
          detail={`${totals.totalMinutes} min total`}
        />
        <Kpi
          icon={Activity}
          accent="ocean"
          label="Beach days"
          value={`${totals.sessionCount}`}
          detail={totals.sessionCount === 1 ? "session logged" : "sessions logged"}
        />
        <Kpi
          icon={Sun}
          accent="gold"
          label="Average sun"
          value={totals.sessionCount ? uvLevelWord(totals.avgUv) : "—"}
          detail={totals.sessionCount ? `UV ${totals.avgUv.toFixed(0)} on average` : "No data yet"}
        />
        <Kpi
          icon={Droplets}
          accent="ocean"
          label="Water"
          value={`${totals.totalMl} mL`}
          detail={
            totals.recommendedMl > 0
              ? `${totals.fluidBalancePct}% of your goal`
              : "No hydration data"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-sky-500" strokeWidth={2} />
            Past sessions
          </CardTitle>
          <CardDescription>A simple log of your days at the beach</CardDescription>
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
          Type {s.setup.skinType} • {sunscreenLabel(s.setup.spf)}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Cell label="Time in sun" value={`${s.durationMinutes} min`} />
        <Cell label="Sun power" value={uvLevelWord(s.uvIndexAvg)} />
        <Cell
          label="Water"
          value={`${s.waterMlLogged} mL`}
          sub={balance != null ? `${balance}% of goal` : undefined}
        />
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
