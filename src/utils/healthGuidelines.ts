import type { WeatherMarineSnapshot } from "@/utils/sessionTypes";

/**
 * Sun-exposure guidance aligned with the Israeli Ministry of Health
 * (משרד הבריאות) and the Israel Cancer Association recommendations.
 */

/** Peak radiation window (local time) per Ministry of Health guidance. */
export const MOH_PEAK_START_HOUR = 10;
export const MOH_PEAK_END_HOUR = 16;

/** UV Index at/above which full sun protection is mandatory. */
export const MOH_UV_PROTECTION_THRESHOLD = 5;

export const MOH_PEAK_HOURS_TEXT =
  "שעות שיא קרינה (10:00-16:00) - מומלץ לצמצם חשיפה ישירה לפי הנחיות משרד הבריאות";

export const MOH_UV_PROTECTION_TEXT =
  "מדד ה-UV גבוה (5 ומעלה) - לפי הנחיות הבריאות חובה הגנה מלאה: כובע, צל וקרם הגנה.";

export const MOH_DISCLAIMER_TEXT =
  "הנתונים ומגבלות הבטיחות באפליקציה מבוססים על המלצות משרד הבריאות הישראלי והאגודה למלחמה בסרטן לחשיפה חכמה בשמש.";

/** Wall-clock hour (0–23) at the selected location, or null when unknown. */
export function getLocationLocalHour(
  weather: Pick<WeatherMarineSnapshot, "localTime"> | null | undefined,
): number | null {
  if (!weather?.localTime) return null;
  const parsed = new Date(weather.localTime);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getHours();
}

/** True when the location's local time falls within the peak radiation window. */
export function isPeakSunHours(localHour: number | null): boolean {
  if (localHour == null) return false;
  return localHour >= MOH_PEAK_START_HOUR && localHour < MOH_PEAK_END_HOUR;
}

/** True when UV is high enough to require full protection per MOH standards. */
export function requiresFullProtection(uvIndex: number | null | undefined): boolean {
  return (uvIndex ?? 0) >= MOH_UV_PROTECTION_THRESHOLD;
}
