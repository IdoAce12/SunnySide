"use client";

import {
  AlertTriangle,
  Droplets,
  Thermometer,
  Umbrella,
  Waves,
  Wind,
} from "lucide-react";
import type { WeatherMarineSnapshot } from "@/utils/sessionTypes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { MetricsGridSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";
import type { WeatherStatus } from "@/hooks/useWeather";

interface PremiumMetricsProps {
  status: WeatherStatus;
  weather: WeatherMarineSnapshot | null;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function PremiumMetrics({
  status,
  weather,
  errorMessage,
  onRetry,
}: PremiumMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Environmental telemetry</CardTitle>
            <CardDescription>
              Open-Meteo •{" "}
              {weather
                ? `${weather.latitude.toFixed(2)}°, ${weather.longitude.toFixed(2)}°`
                : "Awaiting coordinates"}
            </CardDescription>
          </div>
          {weather?.source === "fallback" ? (
            <span className="rounded-md border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Cached
            </span>
          ) : (
            <span className="rounded-md border border-sky-900/50 bg-sky-950/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-sky-400/90">
              Live
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {status === "loading" ? <MetricsGridSkeleton /> : null}

        {status === "error" && errorMessage ? (
          <div className="mb-4">
            <ErrorState
              title="Weather service degraded"
              message={`${errorMessage} Displaying last-known estimates.`}
              onRetry={onRetry}
            />
          </div>
        ) : null}

        {weather && status !== "loading" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricCell
              icon={Umbrella}
              label="UV Index"
              value={weather.uvIndex.toFixed(1)}
              accent="gold"
              highlight={weather.uvIndex >= 8}
            />
            <MetricCell
              icon={Thermometer}
              label="Air"
              value={`${weather.airTempC}°C`}
              accent="neutral"
            />
            <MetricCell
              icon={Droplets}
              label="Sea surface"
              value={weather.waterTempC != null ? `${weather.waterTempC}°C` : "—"}
              accent="marine"
            />
            <MetricCell
              icon={Waves}
              label="Swell"
              value={weather.waveHeightM != null ? `${weather.waveHeightM} m` : "—"}
              accent="marine"
            />
            <MetricCell
              icon={Wind}
              label="Wind"
              value={`${weather.windSpeedKph} km/h`}
              accent="marine"
            />
            <MetricCell
              icon={AlertTriangle}
              label="Marine hazard"
              value={
                weather.jellyfishAlert === "none"
                  ? "Clear"
                  : weather.jellyfishAlert === "possible"
                    ? "Monitor"
                    : "Elevated"
              }
              accent={weather.jellyfishAlert === "high" ? "warn" : "marine"}
            />
          </div>
        ) : null}

        {weather ? (
          <p className="mt-4 text-[11px] tabular-nums text-zinc-600">
            Updated {new Date(weather.fetchedAt).toLocaleTimeString()}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MetricCell({
  icon: Icon,
  label,
  value,
  accent = "neutral",
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  accent?: "neutral" | "marine" | "gold" | "warn";
  highlight?: boolean;
}) {
  const accentBorder =
    accent === "gold"
      ? "border-amber-900/40"
      : accent === "marine"
        ? "border-sky-900/40"
        : accent === "warn"
          ? "border-red-900/40"
          : "border-zinc-800";

  const iconColor =
    accent === "gold"
      ? "text-amber-600/90"
      : accent === "marine"
        ? "text-sky-500/80"
        : accent === "warn"
          ? "text-red-400/80"
          : "text-zinc-500";

  return (
    <div
      className={cn(
        "rounded-xl border bg-zinc-950/60 p-4 backdrop-blur-sm",
        accentBorder,
        highlight && "ring-1 ring-amber-700/30",
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className={cn("size-4", iconColor)} strokeWidth={1.75} />
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          {label}
        </span>
      </div>
      <div className="text-xl font-semibold tabular-nums tracking-tight text-zinc-50">
        {value}
      </div>
    </div>
  );
}
