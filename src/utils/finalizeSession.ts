import type { ActiveSessionState, CompletedSessionRecord } from "@/utils/sessionTypes";
import type { HydrationResult, SunCalcResult } from "@/utils/sunCalc";
import { calculateSedAbsorbed } from "@/utils/sunCalc";
import { clearActiveSession, loadHistory, saveHistory } from "@/utils/storage";
import { getSupabase } from "@/utils/supabaseClient";

function sessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function finalizeSession({
  active,
  exposure,
  hydration,
  uvIndex,
}: {
  active: ActiveSessionState;
  exposure: SunCalcResult;
  hydration: HydrationResult;
  uvIndex: number;
}): Promise<CompletedSessionRecord> {
  const endedAt = Date.now();
  const durationMinutes = Math.max(1, Math.floor((endedAt - active.startedAt) / 60_000));
  const sedAbsorbed = calculateSedAbsorbed(exposure.sedPerMinute, durationMinutes);

  const record: CompletedSessionRecord = {
    id: sessionId(),
    startedAt: active.startedAt,
    endedAt,
    durationMinutes,
    waterMlLogged: active.waterMlLogged,
    setup: active.setup,
    uvIndexAvg: uvIndex,
    sedAbsorbed,
    medJPerM2: exposure.medJPerM2,
    safeExposureMinutes: exposure.safeExposureMinutes,
    recommendedMlTotal: hydration.recommendedMl,
    weatherAtStart: active.weatherAtStart,
  };

  saveHistory([record, ...loadHistory()].slice(0, 120));
  clearActiveSession();

  const supabase = getSupabase();
  if (supabase) {
    await supabase.from("sun_sessions").insert({
      id: record.id,
      started_at: new Date(record.startedAt).toISOString(),
      ended_at: new Date(record.endedAt).toISOString(),
      duration_minutes: record.durationMinutes,
      water_ml: record.waterMlLogged,
      skin_type: record.setup.skinType,
      spf: record.setup.spf === "none" ? 0 : record.setup.spf,
      uv_index_avg: record.uvIndexAvg,
      sed_absorbed: record.sedAbsorbed,
      weather_json: record.weatherAtStart,
    });
  }

  return record;
}
