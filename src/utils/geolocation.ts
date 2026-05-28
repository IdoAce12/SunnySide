export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationOutcome {
  ok: boolean;
  coords: Coordinates | null;
  reason?: "unsupported" | "denied" | "timeout" | "offline" | "error";
}

/**
 * Resolve device coordinates with a hard timeout. Never rejects — always
 * resolves with an outcome so the UI can degrade gracefully (no freeze).
 */
export function requestGeolocation(timeoutMs = 8000): Promise<GeolocationOutcome> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ ok: false, coords: null, reason: "unsupported" });
      return;
    }
    if (!navigator.onLine) {
      resolve({ ok: false, coords: null, reason: "offline" });
      return;
    }

    let settled = false;
    const finish = (outcome: GeolocationOutcome) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };

    const hardTimeout = window.setTimeout(
      () => finish({ ok: false, coords: null, reason: "timeout" }),
      timeoutMs,
    );

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(hardTimeout);
        finish({
          ok: true,
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
        });
      },
      (err) => {
        window.clearTimeout(hardTimeout);
        const reason =
          err.code === err.PERMISSION_DENIED
            ? "denied"
            : err.code === err.TIMEOUT
              ? "timeout"
              : "error";
        finish({ ok: false, coords: null, reason });
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 300_000 },
    );
  });
}
