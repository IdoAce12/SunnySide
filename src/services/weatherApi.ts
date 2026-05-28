import type { WeatherMarineSnapshot } from "@/utils/sessionTypes";

/**
 * Open-Meteo Forecast API response (subset).
 *
 * We request the `current` block with `timezone=auto`, so every reading is
 * evaluated against the SELECTED location's active timezone — not the device
 * clock. If it is 14:24 in Miami, `current.uv_index` reflects Miami's live sun.
 */
export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation?: string;
  utc_offset_seconds: number;
  current?: {
    time: string;
    uv_index?: number;
    temperature_2m?: number;
    wind_speed_10m?: number;
  };
}

/** Open-Meteo Marine API response (subset). */
export interface OpenMeteoMarineResponse {
  latitude: number;
  longitude: number;
  current?: {
    time: string;
    sea_surface_temperature?: number;
    wave_height?: number;
  };
}

export interface WeatherApiError {
  code: "NETWORK" | "PARSE" | "EMPTY" | "UNKNOWN";
  message: string;
}

export type WeatherFetchResult =
  | { ok: true; data: WeatherMarineSnapshot }
  | { ok: false; error: WeatherApiError };

/** Tel Aviv beach — the default *coordinate* (no offline data, just a start point). */
export const TEL_AVIV_COORDS = {
  latitude: 32.0853,
  longitude: 34.7818,
} as const;

export const DEFAULT_COORDS = TEL_AVIV_COORDS;

const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";
const MARINE_BASE = "https://marine-api.open-meteo.com/v1/marine";

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

/**
 * Fetch live forecast + marine conditions for exact coordinates.
 *
 * Always hits the network. There is no offline cache, no hardcoded fallback,
 * and no `navigator.onLine` interception — on failure the caller renders a
 * clean "network required" state.
 */
export async function fetchWeatherMarine(
  latitude: number = TEL_AVIV_COORDS.latitude,
  longitude: number = TEL_AVIV_COORDS.longitude,
): Promise<WeatherFetchResult> {
  const forecastParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "uv_index,temperature_2m,wind_speed_10m",
    timezone: "auto",
    forecast_days: "1",
  });

  const marineParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "sea_surface_temperature,wave_height",
    timezone: "auto",
    forecast_days: "1",
  });

  let forecast: OpenMeteoForecastResponse;
  let marine: PromiseSettledResult<OpenMeteoMarineResponse>;

  try {
    const [forecastResult, marineResult] = await Promise.allSettled([
      fetchJson<OpenMeteoForecastResponse>(`${FORECAST_BASE}?${forecastParams}`),
      fetchJson<OpenMeteoMarineResponse>(`${MARINE_BASE}?${marineParams}`),
    ]);

    if (forecastResult.status !== "fulfilled") {
      return {
        ok: false,
        error: {
          code: "NETWORK",
          message: "Unable to reach the weather service.",
        },
      };
    }

    forecast = forecastResult.value;
    marine = marineResult;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown network error";
    return { ok: false, error: { code: "NETWORK", message } };
  }

  const current = forecast.current;
  if (!current) {
    return {
      ok: false,
      error: {
        code: "EMPTY",
        message: "Weather service returned no current readings for this location.",
      },
    };
  }

  const uvIndex = current.uv_index ?? 0;
  const airTempC = current.temperature_2m ?? 0;
  const windSpeedKph = Math.round(current.wind_speed_10m ?? 0);

  let waterTempC: number | null = null;
  let waveHeightM: number | null = null;
  if (marine.status === "fulfilled" && marine.value.current) {
    waterTempC = marine.value.current.sea_surface_temperature ?? null;
    waveHeightM = marine.value.current.wave_height ?? null;
  }

  const snapshot: WeatherMarineSnapshot = {
    latitude: forecast.latitude,
    longitude: forecast.longitude,
    uvIndex: Number(uvIndex.toFixed(1)),
    airTempC: Number(airTempC.toFixed(1)),
    waterTempC: waterTempC != null ? Number(waterTempC.toFixed(1)) : null,
    waveHeightM: waveHeightM != null ? Number(waveHeightM.toFixed(2)) : null,
    windSpeedKph,
    jellyfishAlert: jellyfishRisk(waveHeightM, windSpeedKph),
    fetchedAt: Date.now(),
    source: "open-meteo",
    timezone: forecast.timezone,
    localTime: current.time,
  };

  return { ok: true, data: snapshot };
}
