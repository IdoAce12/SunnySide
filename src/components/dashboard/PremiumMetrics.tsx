"use client";

import { Clock, Sun, Thermometer, Waves } from "lucide-react";
import type { WeatherMarineSnapshot } from "@/utils/sessionTypes";
import { swellLevelWord, uvLevelWord } from "@/utils/sunCalc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricsGridSkeleton } from "@/components/ui/Skeleton";
import { HealthDisclaimer } from "@/components/ui/HealthDisclaimer";
import { cn } from "@/utils/cn";
import type { WeatherStatus } from "@/hooks/useWeather";

interface PremiumMetricsProps {
  status: WeatherStatus;
  weather: WeatherMarineSnapshot | null;
  locationName?: string;
}

function formatLocalTime(weather: WeatherMarineSnapshot): string | null {
  if (!weather.localTime) return null;
  const parsed = new Date(weather.localTime);
  if (Number.isNaN(parsed.getTime())) return null;
  const hh = String(parsed.getHours()).padStart(2, "0");
  const mm = String(parsed.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function PremiumMetrics({ status, weather, locationName }: PremiumMetricsProps) {
  const localTime = weather ? formatLocalTime(weather) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>At the beach</CardTitle>
            <CardDescription>{locationName ?? "Live conditions"}</CardDescription>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {status === "loading" || !weather ? (
          <MetricsGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={Clock}
              accent="ocean"
              label="Local Time"
              value={localTime ?? "—"}
              sub={weather.timezone ?? "Destination time"}
            />
            <MetricCard
              icon={Sun}
              accent="gold"
              label="UV Power"
              value={`${weather.uvIndex.toFixed(0)}`}
              sub={uvLevelWord(weather.uvIndex)}
              highlight={weather.uvIndex >= 8}
            />
            <MetricCard
              icon={Thermometer}
              accent="gold"
              label="Temperature"
              value={`${Math.round(weather.airTempC)}°`}
              sub={
                weather.waterTempC != null
                  ? `Air · ${Math.round(weather.waterTempC)}° Sea`
                  : "Air temperature"
              }
            />
            <MetricCard
              icon={Waves}
              accent="ocean"
              label="Sea Swell"
              value={weather.waveHeightM != null ? `${weather.waveHeightM.toFixed(1)}m` : "—"}
              sub={swellLevelWord(weather.waveHeightM)}
            />
          </div>
        )}

        <HealthDisclaimer className="mt-4" />
      </CardContent>
    </Card>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  sub: string;
  accent: "ocean" | "gold";
  highlight?: boolean;
}) {
  const tile = accent === "gold" ? "border-amber-100 bg-amber-50/50" : "border-sky-100 bg-sky-50/40";
  const iconColor = accent === "gold" ? "text-amber-500" : "text-sky-500";

  return (
    <div className={cn("rounded-2xl border p-4 sm:p-5", tile, highlight && "ring-2 ring-amber-200")}>
      <div className="mb-2 flex items-center gap-2">
        <Icon className={cn("size-4", iconColor)} strokeWidth={2} />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <div className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
        {value}
      </div>
      <div className="mt-1 text-xs font-medium text-slate-500">{sub}</div>
    </div>
  );
}
