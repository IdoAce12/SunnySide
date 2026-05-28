import type {
  ActiveSessionState,
  CompletedSessionRecord,
  SetupSelections,
} from "@/utils/sessionTypes";

const KEY_SETUP = "sunnyside:v2:setup";
const KEY_ACTIVE = "sunnyside:v2:active";
const KEY_HISTORY = "sunnyside:v2:history";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Migrate legacy cup-based sessions to mL. */
function migrateActive(raw: ActiveSessionState & { waterCupsLogged?: number }): ActiveSessionState {
  if ("waterMlLogged" in raw && typeof raw.waterMlLogged === "number") return raw;
  const cups = raw.waterCupsLogged ?? 0;
  const { waterCupsLogged: _cups, ...rest } = raw;
  void _cups;
  return { ...rest, waterMlLogged: cups * 250 };
}

function migrateRecord(
  raw: CompletedSessionRecord & { waterCups?: number },
): CompletedSessionRecord {
  if ("waterMlLogged" in raw && typeof raw.waterMlLogged === "number") return raw;
  const cups = raw.waterCups ?? 0;
  const { waterCups: _cups, ...rest } = raw;
  void _cups;
  return {
    ...rest,
    waterMlLogged: cups * 250,
    sedAbsorbed: raw.sedAbsorbed ?? 0,
    medJPerM2: raw.medJPerM2 ?? 300,
    safeExposureMinutes: raw.safeExposureMinutes ?? 30,
    recommendedMlTotal: raw.recommendedMlTotal ?? cups * 250,
  };
}

export function loadSetup(): SetupSelections | null {
  if (typeof window === "undefined") return null;
  return safeParse<SetupSelections>(window.localStorage.getItem(KEY_SETUP));
}

export function saveSetup(setup: SetupSelections): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_SETUP, JSON.stringify(setup));
}

export function loadActiveSession(): ActiveSessionState | null {
  if (typeof window === "undefined") return null;
  const raw = safeParse<ActiveSessionState & { waterCupsLogged?: number }>(
    window.localStorage.getItem(KEY_ACTIVE),
  );
  if (!raw) return null;
  return migrateActive(raw);
}

export function saveActiveSession(active: ActiveSessionState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_ACTIVE, JSON.stringify(active));
}

export function clearActiveSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY_ACTIVE);
}

export function loadHistory(): CompletedSessionRecord[] {
  if (typeof window === "undefined") return [];
  const raw =
    safeParse<(CompletedSessionRecord & { waterCups?: number })[]>(
      window.localStorage.getItem(KEY_HISTORY),
    ) ?? [];
  return raw.map(migrateRecord);
}

export function saveHistory(history: CompletedSessionRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
}
