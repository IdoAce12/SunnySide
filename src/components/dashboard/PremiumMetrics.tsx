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
  locationName?: string;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function PremiumMetrics({
  status,
  weather,
  locationName,
  errorMessage,
  onRetry,
}: PremiumMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Live conditions</CardTitle>
            <CardDescription>
              {locationName ? `${locationName} • ` : ""}Open-Meteo{" "}
              {weather
                ? `· ${weather.latitude.toFixed(2)}°, ${weather.longitude.toFixed(2)}°`
                : ""}
            </CardDescription>
          </div>
          {weather?.source === "fallback" ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Cached
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {status === "loading" && !weather ? <MetricsGridSkeleton /> : null}

        {status === "error" && errorMessage ? (
          <div className="mb-4">
            <ErrorState
              title="Weather service degraded"
              message={`${errorMessage} Displaying last-known estimates.`}
              onRetry={onRetry}
            />
          </div>
        ) : null}

        {weather ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricCell
              icon={Umbrella}
              label="UV Index"
              value={weather.uvIndex.toFixed(1)}
              accent="gold"
              highlight={weather.uvIndex >= 8}
            />
            <MetricCell icon={Thermometer} label="Air" value={`${weather.airTempC}°C`} accent="gold" />
            <MetricCell
              icon={Droplets}
              label="Sea surface"
              value={weather.waterTempC != null ? `${weather.waterTempC}°C` : "—"}
              accent="ocean"
            />
            <MetricCell
              icon={Waves}
              label="Swell"
              value={weather.waveHeightM != null ? `${weather.waveHeightM} m` : "—"}
              accent="ocean"
            />
            <MetricCell icon={Wind} label="Wind" value={`${weather.windSpeedKph} km/h`} accent="ocean" />
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
              accent={weather.jellyfishAlert === "high" ? "warn" : "ocean"}
            />
          </div>
        ) : null}

        {weather ? (
          <p className="mt-4 text-[11px] tabular-nums text-slate-400">
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
  accent = "ocean",
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  accent?: "ocean" | "gold" | "warn";
  highlight?: boolean;
}) {
  const tile =
    accent === "gold"
      ? "border-amber-100 bg-amber-50/50"
      : accent === "warn"
        ? "border-rose-100 bg-rose-50/50"
        : "border-sky-100 bg-sky-50/40";

  const iconColor =
    accent === "gold"
      ? "text-amber-500"
      : accent === "warn"
        ? "text-rose-500"
        : "text-sky-500";

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        tile,
        highlight && "ring-2 ring-amber-200",
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className={cn("size-4", iconColor)} strokeWidth={2} />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <div className="text-xl font-semibold tabular-nums tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}
