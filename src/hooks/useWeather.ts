"use client";

import { useCallback, useEffect, useState } from "react";
import type { WeatherMarineSnapshot } from "@/utils/sessionTypes";
import {
  createTelAvivFallbackWeather,
  DEFAULT_COORDS,
  fetchWeatherMarine,
  loadCachedTelAvivWeather,
  TEL_AVIV_COORDS,
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

export function useWeather(
  coords?: { latitude: number; longitude: number },
): UseWeatherResult {
  const isOffline = useOnline();
  const [geoPosition, setGeoPosition] = useState<{ latitude: number; longitude: number }>(
    DEFAULT_COORDS,
  );
  const [status, setStatus] = useState<WeatherStatus>("idle");
  const [weather, setWeather] = useState<WeatherMarineSnapshot | null>(() =>
    typeof window !== "undefined" ? loadCachedTelAvivWeather() : null,
  );
  const [error, setError] = useState<WeatherApiError | null>(null);
  const [usingCache, setUsingCache] = useState(false);

  const position = coords ?? geoPosition;

  useEffect(() => {
    if (coords) return;
    if (!navigator.geolocation) return;

    const timeoutId = window.setTimeout(() => {
      setGeoPosition(TEL_AVIV_COORDS);
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(timeoutId);
        setGeoPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        window.clearTimeout(timeoutId);
        setGeoPosition(TEL_AVIV_COORDS);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );

    return () => window.clearTimeout(timeoutId);
  }, [coords]);

  const refresh = useCallback(async () => {
    if (isOffline) {
      const cached = loadCachedTelAvivWeather() ?? createTelAvivFallbackWeather();
      setWeather(cached);
      setUsingCache(true);
      setError({
        code: "OFFLINE",
        message: "Device is offline. Using cached Tel Aviv beach data.",
      });
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);

    const result = await fetchWeatherMarine(
      position.latitude,
      position.longitude,
    );

    setWeather(result.data);
    setUsingCache(result.fromCache);

    if (result.ok) {
      setStatus("ready");
      setError(null);
    } else {
      setError(result.error);
      setStatus("error");
    }
  }, [isOffline, position.latitude, position.longitude]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await refresh();
      if (cancelled) return;
    };

    void run();
    const id = window.setInterval(() => void refresh(), 5 * 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [refresh]);

  return { status, weather, error, isOffline, usingCache, refresh };
}
