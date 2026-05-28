/**
 * Scientific sun exposure & hydration models for SunnySide.
 *
 * UV exposure uses Minimal Erythemal Dose (MED) principles:
 *   t_safe (min) = MED / (UV_index × 0.025 W/m²) / transmission
 *
 * SPF transmission (UVB blocked): 15→93%, 30→97%, 50→98%.
 *
 * Guard: UV ≤ 0 or invalid → safeExposureMinutes = 0, noExposure = true.
 */

export type FitzpatrickSkinType = 1 | 2 | 3 | 4 | 5 | 6;

export type SunscreenChoice = "none" | 15 | 30 | 50;

/** MED in J/m² — erythemally weighted minimal dose to induce perceptible erythema. */
const MED_J_PER_M2: Record<FitzpatrickSkinType, number> = {
  1: 200,
  2: 250,
  3: 300,
  4: 450,
  5: 600,
  6: 1000,
};

/** Fraction of UVB transmitted after sunscreen (1 − block fraction). */
const SPF_TRANSMISSION: Record<SunscreenChoice, number> = {
  none: 1,
  15: 0.07,
  30: 0.03,
  50: 0.02,
};

/** UV Index → erythemally weighted irradiance (W/m²). WHO conversion factor. */
const UV_INDEX_TO_IRRADIANCE = 0.025;

export interface SunCalcInputs {
  skinType: FitzpatrickSkinType;
  uvIndex: number | null | undefined;
  spf: SunscreenChoice;
}

export interface SunCalcResult {
  medJPerM2: number;
  uvIrradianceWPerM2: number;
  spfTransmission: number;
  /** Minutes until MED at constant UV. 0 when noExposure. */
  safeExposureMinutes: number;
  sedPerMinute: number;
  /** UV is zero or invalid — do not show inflated limits. */
  noExposure: boolean;
}

export interface HydrationInputs {
  elapsedMinutes: number;
  airTempC: number;
  uvIndex: number | null | undefined;
  waterMlLogged: number;
}

export interface HydrationResult {
  fluidLossRateMlPerHour: number;
  recommendedMl: number;
  deficitMl: number;
  logIncrementMl: number;
}

export function getSkinTypeLabel(type: FitzpatrickSkinType): string {
  const labels: Record<FitzpatrickSkinType, string> = {
    1: "Type I — Burns easily, never tans",
    2: "Type II — Burns easily, tans minimally",
    3: "Type III — Sometimes burns, tans uniformly",
    4: "Type IV — Tans easily, rarely burns",
    5: "Type V — Very rarely burns",
    6: "Type VI — Deeply pigmented, minimal burn risk",
  };
  return labels[type];
}

export function getSkinTypeShort(type: FitzpatrickSkinType): string {
  return `Fitzpatrick ${["I", "II", "III", "IV", "V", "VI"][type - 1]}`;
}

export function sunscreenLabel(spf: SunscreenChoice): string {
  if (spf === "none") return "None";
  return `SPF ${spf}`;
}

export function getSpfBlockPercent(spf: SunscreenChoice): number {
  const blocked: Record<SunscreenChoice, number> = {
    none: 0,
    15: 93,
    30: 97,
    50: 98,
  };
  return blocked[spf];
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function getMedForSkinType(type: FitzpatrickSkinType): number {
  return MED_J_PER_M2[type];
}

/** Normalize UV input; null/undefined/NaN → 0. */
export function normalizeUvIndex(uvIndex: number | null | undefined): number {
  if (uvIndex == null || !Number.isFinite(uvIndex)) return 0;
  return clamp(uvIndex, 0, 15);
}

/** True when exposure calculations must return zero budget. */
export function shouldBlockExposure(
  uvIndex: number | null | undefined,
): boolean {
  return normalizeUvIndex(uvIndex) <= 0;
}

/**
 * Safe exposure limit from MED and current UV Index.
 * Never divides by zero; returns 0 minutes when UV ≤ 0.
 */
export function calculateSafeExposure({
  skinType,
  uvIndex,
  spf,
}: SunCalcInputs): SunCalcResult {
  const medJPerM2 = getMedForSkinType(skinType);
  const spfTransmission = SPF_TRANSMISSION[spf];
  const uv = normalizeUvIndex(uvIndex);

  if (shouldBlockExposure(uv)) {
    return {
      medJPerM2,
      uvIrradianceWPerM2: 0,
      spfTransmission,
      safeExposureMinutes: 0,
      sedPerMinute: 0,
      noExposure: true,
    };
  }

  const uvIrradianceWPerM2 = uv * UV_INDEX_TO_IRRADIANCE;
  const effectiveIrradiance = uvIrradianceWPerM2 * spfTransmission;
  const secondsToMed = medJPerM2 / effectiveIrradiance;
  const safeExposureMinutes = clamp(secondsToMed / 60, 1, 24 * 60);

  const sedPerMinute = (uvIrradianceWPerM2 * 60) / 100;

  return {
    medJPerM2,
    uvIrradianceWPerM2,
    spfTransmission,
    safeExposureMinutes,
    sedPerMinute,
    noExposure: false,
  };
}

export function calculateHydration({
  elapsedMinutes,
  airTempC,
  uvIndex,
  waterMlLogged,
}: HydrationInputs): HydrationResult {
  const mins = clamp(elapsedMinutes, 0, 24 * 60);
  const temp = clamp(airTempC, 5, 45);
  const uv = normalizeUvIndex(uvIndex);
  const hours = mins / 60;

  const tempComponent = 350 + Math.max(0, temp - 22) * 22;
  const uvMultiplier = 1 + Math.max(0, uv - 3) * 0.04;

  const fluidLossRateMlPerHour = tempComponent * uvMultiplier;
  const recommendedMl = Math.round(fluidLossRateMlPerHour * hours);
  const deficitMl = Math.max(0, recommendedMl - waterMlLogged);

  return {
    fluidLossRateMlPerHour: Math.round(fluidLossRateMlPerHour),
    recommendedMl,
    deficitMl,
    logIncrementMl: 250,
  };
}

export function calculateSedAbsorbed(
  sedPerMinute: number,
  elapsedMinutes: number,
): number {
  return Number((sedPerMinute * clamp(elapsedMinutes, 0, 24 * 60)).toFixed(2));
}

export function remainingSafeMinutes(
  safeExposureMinutes: number,
  elapsedMinutes: number,
  noExposure = false,
): number {
  if (noExposure || safeExposureMinutes <= 0) return 0;
  return Math.max(0, safeExposureMinutes - elapsedMinutes);
}

export function safeExposureProgressPercent(
  safeExposureMinutes: number,
  elapsedMinutes: number,
  noExposure = false,
): number {
  if (noExposure || safeExposureMinutes <= 0) return 0;
  const remaining = remainingSafeMinutes(safeExposureMinutes, elapsedMinutes);
  return clamp((remaining / safeExposureMinutes) * 100, 0, 100);
}
