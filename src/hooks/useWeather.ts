"use client";

import { useCallback, useEffect, useState } from "react";
import type { WeatherMarineSnapshot } from "@/utils/sessionTypes";
import {
  createFallbackWeather,
  DEFAULT_COORDS,
  fetchWeatherMarine,
  loadCachedWeather,
  type WeatherApiError,
} from "@/services/weatherApi";
import { useOnline } from "@/hooks/useOnline";

export type WeatherStatus = "idle" | "loading" | "ready" | "error";

export interface UseWeatherResult {
  status: WeatherStatus;
  weather: WeatherMarineSnapshot | null;
  error: WeatherApiError | null;
  isOffline: boolean;
  usingCache: boolean;
  refresh: () => void;
}

/**
 * Controlled weather hook. The caller owns the active coordinates (e.g. via the
 * LocationPicker); changing them instantly forces a re-fetch from Open-Meteo.
 * There is no internal geolocation call here, so the UI can never freeze on a
 * stuck permission prompt — geolocation is an explicit, timed-out action.
 */
export function useWeather(
  coords?: { latitude: number; longitude: number },
): UseWeatherResult {
  const isOffline = useOnline();
  const latitude = coords?.latitude ?? DEFAULT_COORDS.latitude;
  const longitude = coords?.longitude ?? DEFAULT_COORDS.longitude;

  const [status, setStatus] = useState<WeatherStatus>("idle");
  const [weather, setWeather] = useState<WeatherMarineSnapshot | null>(() =>
    typeof window !== "undefined" ? loadCachedWeather(latitude, longitude) : null,
  );
  const [error, setError] = useState<WeatherApiError | null>(null);
  const [usingCache, setUsingCache] = useState(false);

  const refresh = useCallback(async () => {
    if (isOffline) {
      const cached =
        loadCachedWeather(latitude, longitude) ??
        createFallbackWeather(latitude, longitude);
      setWeather(cached);
      setUsingCache(true);
      setError({
        code: "OFFLINE",
        message: "Device is offline. Showing cached coastal data.",
      });
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);

    const result = await fetchWeatherMarine(latitude, longitude);

    setWeather(result.data);
    setUsingCache(result.fromCache);

    if (result.ok) {
      setStatus("ready");
      setError(null);
    } else {
      setError(result.error);
      setStatus("error");
    }
  }, [isOffline, latitude, longitude]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 5 * 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return { status, weather, error, isOffline, usingCache, refresh };
}
