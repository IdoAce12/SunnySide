"use client";

import { ActiveTracker } from "@/components/session/ActiveTracker";
import { WaitState } from "@/components/session/WaitState";
import { MetricsGridSkeleton } from "@/components/ui/Skeleton";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { useWeather } from "@/hooks/useWeather";
import { weatherDataFromSnapshot, type WeatherData } from "@/types/weather";
import { loadActiveSession } from "@/utils/storage";
import { isZeroUvIndex } from "@/utils/uv";

function initialSessionCoords():
  | { latitude: number; longitude: number }
  | undefined {
  const active = loadActiveSession();
  if (!active) return undefined;
  return {
    latitude: active.weatherAtStart.latitude,
    longitude: active.weatherAtStart.longitude,
  };
}

/**
 * Routes between live tracking and the zero-UV wait state.
 * Uses live Open-Meteo readings for the session coordinates when available, and
 * falls back to the snapshot captured at session start (not an offline cache —
 * just this session's own recorded conditions).
 */
export function SessionManager() {
  const sessionCoords = initialSessionCoords();
  const { status, weather } = useWeather(sessionCoords);

  let weatherData: WeatherData | null = null;
  if (weather) {
    weatherData = weatherDataFromSnapshot(weather);
  } else {
    const active = loadActiveSession();
    if (active) weatherData = weatherDataFromSnapshot(active.weatherAtStart);
  }

  const currentUv = weatherData?.uv_index ?? null;
  const showWaitState = currentUv !== null && isZeroUvIndex(currentUv);

  if (status === "loading" && weatherData === null) {
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-500">
            Session
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Checking conditions
          </h1>
        </header>
        <MetricsGridSkeleton />
      </div>
    );
  }

  if (showWaitState && weatherData) {
    return (
      <ErrorBoundary fallbackTitle="Wait state error">
        <WaitState weatherData={weatherData} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Tracker error">
      <ActiveTracker />
    </ErrorBoundary>
  );
}
