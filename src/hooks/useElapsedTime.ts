"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseElapsedTimeOptions {
  /** Epoch ms when tracking began. Null = paused / not started. */
  startTime: number | null;
  /** Optional tick interval for UI refresh (ms). Default 1000. */
  tickMs?: number;
}

export interface UseElapsedTimeResult {
  elapsedMs: number;
  elapsedSeconds: number;
  elapsedMinutes: number;
  sync: () => void;
}

function computeElapsed(startTime: number): number {
  return Math.max(0, Date.now() - startTime);
}

export function useElapsedTime({
  startTime,
  tickMs = 1000,
}: UseElapsedTimeOptions): UseElapsedTimeResult {
  const startRef = useRef(startTime);

  useEffect(() => {
    startRef.current = startTime;
  }, [startTime]);

  const [elapsedMs, setElapsedMs] = useState(() =>
    startTime ? computeElapsed(startTime) : 0,
  );

  const sync = useCallback(() => {
    const start = startRef.current;
    if (!start) {
      setElapsedMs(0);
      return;
    }
    setElapsedMs(computeElapsed(start));
  }, []);

  useEffect(() => {
    sync();
  }, [startTime, sync]);

  useEffect(() => {
    if (!startTime) return;

    const onVisibility = () => {
      if (document.visibilityState === "visible") sync();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", sync);

    const interval = window.setInterval(sync, tickMs);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", sync);
      window.removeEventListener("pageshow", sync);
      window.clearInterval(interval);
    };
  }, [startTime, tickMs, sync]);

  return {
    elapsedMs,
    elapsedSeconds: Math.floor(elapsedMs / 1000),
    elapsedMinutes: Math.floor(elapsedMs / 60_000),
    sync,
  };
}

export function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
