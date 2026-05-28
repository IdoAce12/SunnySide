"use client";

import { ActiveTracker } from "@/components/session/ActiveTracker";
import { WaitState } from "@/components/session/WaitState";
import { MetricsGridSkeleton } from "@/components/ui/Skeleton";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { useWeather } from "@/hooks/useWeather";
import { useOnline } from "@/hooks/useOnline";
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
 * Routes between live tracking and zero-UV wait state.
 * Uses live Open-Meteo readings when available; falls back to session snapshot.
 */
export function SessionManager() {
  const isOffline = useOnline();
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
  const showWaitState =
    isOffline || (currentUv !== null && isZeroUvIndex(currentUv));

  if (status === "loading" && weatherData === null) {
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Session
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
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
