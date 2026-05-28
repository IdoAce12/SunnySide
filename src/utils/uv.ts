import { normalizeUvIndex } from "@/utils/sunCalc";

/** True when UV is effectively zero (night / no erythemal radiation). */
export function isZeroUvIndex(uvIndex: number | null | undefined): boolean {
  return normalizeUvIndex(uvIndex) <= 0;
}
