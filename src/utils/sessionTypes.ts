import type { FitzpatrickSkinType, SunscreenChoice } from "@/utils/sunCalc";

export interface WeatherMarineSnapshot {
  latitude: number;
  longitude: number;
  uvIndex: number;
  airTempC: number;
  waterTempC: number | null;
  waveHeightM: number | null;
  windSpeedKph: number;
  jellyfishAlert: "none" | "possible" | "high";
  fetchedAt: number;
  source: "open-meteo";
  /** IANA timezone of the selected location (e.g. "America/New_York"). */
  timezone?: string;
  /** Wall-clock time at the location when the reading was taken (ISO, no zone). */
  localTime?: string;
}

export interface SetupSelections {
  skinType: FitzpatrickSkinType;
  spf: SunscreenChoice;
}

export interface ActiveSessionState {
  /** Epoch ms — authoritative session start (survives background tab freeze). */
  startedAt: number;
  flipIntervalMinutes: number;
  waterMlLogged: number;
  weatherAtStart: WeatherMarineSnapshot;
  setup: SetupSelections;
}

export interface CompletedSessionRecord {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMinutes: number;
  waterMlLogged: number;
  setup: SetupSelections;
  uvIndexAvg: number;
  sedAbsorbed: number;
  medJPerM2: number;
  safeExposureMinutes: number;
  recommendedMlTotal: number;
  weatherAtStart: WeatherMarineSnapshot;
}
