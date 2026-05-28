import type { WeatherMarineSnapshot } from "@/utils/sessionTypes";

/** Open-Meteo Forecast API response (subset). */
export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    uv_index: number[];
    temperature_2m: number[];
    wind_speed_10m: number[];
  };
  daily?: {
    time: string[];
    wave_height_max?: number[];
  };
}

/** Open-Meteo Marine API response (subset). */
export interface OpenMeteoMarineResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    sea_surface_temperature: number[];
    wave_height: number[];
  };
}

export interface WeatherApiError {
  code: "NETWORK" | "PARSE" | "EMPTY" | "OFFLINE" | "UNKNOWN";
  message: string;
}

export type WeatherFetchResult =
  | { ok: true; data: WeatherMarineSnapshot; fromCache: boolean }
  | { ok: false; error: WeatherApiError; data: WeatherMarineSnapshot; fromCache: boolean };

/** Tel Aviv beach — strict default & offline fallback. */
export const TEL_AVIV_COORDS = {
  latitude: 32.0853,
  longitude: 34.7818,
} as const;

export const DEFAULT_COORDS = TEL_AVIV_COORDS;

const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";
const MARINE_BASE = "https://marine-api.open-meteo.com/v1/marine";
const CACHE_KEY = "sunnyside:weather:tel-aviv-v1";
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours

function currentHourIndex(times: string[]): number {
  const now = new Date();
  const hourKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}T${String(now.getUTCHours()).padStart(2, "0")}:00`;

  let idx = times.findIndex((t) => t.startsWith(hourKey.slice(0, 13)));
  if (idx < 0) {
    idx = Math.min(now.getHours(), times.length - 1);
  }
  return Math.max(0, idx);
}

function jellyfishRisk(
  waveM: number | null,
  windKph: number,
): WeatherMarineSnapshot["jellyfishAlert"] {
  if (waveM !== null && waveM > 1.2 && windKph < 12) return "high";
  if (waveM !== null && waveM > 0.6) return "possible";
  return "none";
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export function loadCachedTelAvivWeather(): WeatherMarineSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt: number; data: WeatherMarineSnapshot };
    if (Date.now() - parsed.savedAt > CACHE_MAX_AGE_MS) return parsed.data; // still use stale offline
    return parsed.data;
  } catch {
    return null;
  }
}

export function saveCachedTelAvivWeather(data: WeatherMarineSnapshot): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ savedAt: Date.now(), data }),
  );
}

/** Static Tel Aviv beach profile when network & cache are unavailable. */
export function createTelAvivFallbackWeather(): WeatherMarineSnapshot {
  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour < 19;
  return {
    latitude: TEL_AVIV_COORDS.latitude,
    longitude: TEL_AVIV_COORDS.longitude,
    uvIndex: isDaytime ? 6.5 : 0,
    airTempC: 27,
    waterTempC: 24,
    waveHeightM: 0.45,
    windSpeedKph: 14,
    jellyfishAlert: "none",
    fetchedAt: Date.now(),
    source: "fallback",
  };
}

/** @deprecated Use createTelAvivFallbackWeather */
export function createFallbackWeather(
  lat: number = TEL_AVIV_COORDS.latitude,
  lon: number = TEL_AVIV_COORDS.longitude,
): WeatherMarineSnapshot {
  const base = createTelAvivFallbackWeather();
  return { ...base, latitude: lat, longitude: lon };
}

function resolveOfflineWeather(): WeatherMarineSnapshot {
  const cached = loadCachedTelAvivWeather();
  if (cached) {
    return { ...cached, source: "fallback" as const, fetchedAt: Date.now() };
  }
  return createTelAvivFallbackWeather();
}

export async function fetchWeatherMarine(
  latitude: number = TEL_AVIV_COORDS.latitude,
  longitude: number = TEL_AVIV_COORDS.longitude,
  options?: { forceOffline?: boolean },
): Promise<WeatherFetchResult> {
  if (options?.forceOffline || (typeof navigator !== "undefined" && !navigator.onLine)) {
    const data = resolveOfflineWeather();
    return {
      ok: false,
      error: {
        code: "OFFLINE",
        message: "Device is offline. Using cached Tel Aviv beach data.",
      },
      data,
      fromCache: true,
    };
  }

  try {
    const forecastParams = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      hourly: "uv_index,temperature_2m,wind_speed_10m",
      daily: "wave_height_max",
      timezone: "auto",
      forecast_days: "1",
    });

    const marineParams = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      hourly: "sea_surface_temperature,wave_height",
      timezone: "auto",
      forecast_days: "1",
    });

    const [forecast, marine] = await Promise.allSettled([
      fetchJson<OpenMeteoForecastResponse>(`${FORECAST_BASE}?${forecastParams}`),
      fetchJson<OpenMeteoMarineResponse>(`${MARINE_BASE}?${marineParams}`),
    ]);

    if (forecast.status !== "fulfilled") {
      const data = resolveOfflineWeather();
      return {
        ok: false,
        error: { code: "NETWORK", message: "Unable to reach weather services." },
        data,
        fromCache: true,
      };
    }

    const f = forecast.value;
    const idx = currentHourIndex(f.hourly.time);

    const uvIndex = f.hourly.uv_index[idx] ?? 0;
    const airTempC = f.hourly.temperature_2m[idx] ?? 25;
    const windSpeedKph = Math.round(f.hourly.wind_speed_10m[idx] ?? 0);

    let waterTempC: number | null = null;
    let waveHeightM: number | null = f.daily?.wave_height_max?.[0] ?? null;

    if (marine.status === "fulfilled") {
      const mIdx = currentHourIndex(marine.value.hourly.time);
      waterTempC = marine.value.hourly.sea_surface_temperature[mIdx] ?? null;
      const liveWave = marine.value.hourly.wave_height[mIdx];
      if (liveWave != null) waveHeightM = liveWave;
    }

    const snapshot: WeatherMarineSnapshot = {
      latitude: f.latitude,
      longitude: f.longitude,
      uvIndex: Number(uvIndex.toFixed(1)),
      airTempC: Number(airTempC.toFixed(1)),
      waterTempC: waterTempC != null ? Number(waterTempC.toFixed(1)) : null,
      waveHeightM: waveHeightM != null ? Number(waveHeightM.toFixed(2)) : null,
      windSpeedKph,
      jellyfishAlert: jellyfishRisk(waveHeightM, windSpeedKph),
      fetchedAt: Date.now(),
      source: "open-meteo",
    };

    saveCachedTelAvivWeather(snapshot);

    return { ok: true, data: snapshot, fromCache: false };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const data = resolveOfflineWeather();
    return {
      ok: false,
      error: { code: "UNKNOWN", message },
      data,
      fromCache: true,
    };
  }
}
