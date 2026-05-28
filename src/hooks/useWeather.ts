"use client";

import { useCallback, useEffect, useState } from "react";
import type { WeatherMarineSnapshot } from "@/utils/sessionTypes";
import {
  DEFAULT_COORDS,
  fetchWeatherMarine,
  type WeatherApiError,
} from "@/services/weatherApi";

export type WeatherStatus = "idle" | "loading" | "ready" | "error";

export interface UseWeatherResult {
  status: WeatherStatus;
  weather: WeatherMarineSnapshot | null;
  error: WeatherApiError | null;
  refresh: () => void;
}

/**
 * Controlled, always-live weather hook. The caller owns the active coordinates
 * (via the LocationPicker); changing them instantly forces a fresh Open-Meteo
 * fetch for those exact coordinates and timezone. There is no offline cache or
 * fallback — a network failure surfaces as an error state.
 */
export function useWeather(
  coords?: { latitude: number; longitude: number },
): UseWeatherResult {
  const latitude = coords?.latitude ?? DEFAULT_COORDS.latitude;
  const longitude = coords?.longitude ?? DEFAULT_COORDS.longitude;

  const [status, setStatus] = useState<WeatherStatus>("idle");
  const [weather, setWeather] = useState<WeatherMarineSnapshot | null>(null);
  const [error, setError] = useState<WeatherApiError | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setWeather(null);
    setError(null);

    const result = await fetchWeatherMarine(latitude, longitude);

    if (result.ok) {
      setWeather(result.data);
      setStatus("ready");
      setError(null);
    } else {
      setWeather(null);
      setError(result.error);
      setStatus("error");
    }
  }, [latitude, longitude]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 5 * 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return { status, weather, error, refresh };
}
