"use client";

import * as React from "react";
import {
  cancelScheduledSessionNotifications,
  clearAppBadge,
  currentPermission,
  ensureServiceWorker,
  notificationsSupported,
  requestNotificationPermission,
  scheduleSessionNotifications,
  setAppBadge,
  type PermissionState,
} from "@/utils/notifications";

interface UseSessionNotificationsArgs {
  /** Epoch ms of session start, or null when no session is active. */
  startedAt: number | null;
  /** Whether alerts should be scheduled (session active & exposure valid). */
  enabled: boolean;
  /** Capped safe-exposure limit (minutes). */
  safeLimitMinutes: number;
  /** Live remaining safe minutes, used to drive the home-screen badge. */
  remainingMinutes: number;
  flipIntervalMinutes: number;
  hydrationIntervalMinutes: number;
}

export interface UseSessionNotificationsResult {
  supported: boolean;
  permission: PermissionState;
  enableAlerts: () => Promise<void>;
  clearSessionAlerts: () => void;
}

export function useSessionNotifications({
  startedAt,
  enabled,
  safeLimitMinutes,
  remainingMinutes,
  flipIntervalMinutes,
  hydrationIntervalMinutes,
}: UseSessionNotificationsArgs): UseSessionNotificationsResult {
  const [permission, setPermission] = React.useState<PermissionState>("unsupported");
  const scheduledForRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setPermission(currentPermission());
    void ensureServiceWorker();
  }, []);

  const enableAlerts = React.useCallback(async () => {
    const next = await requestNotificationPermission();
    setPermission(next);
  }, []);

  React.useEffect(() => {
    if (!enabled || startedAt == null) return;
    if (permission !== "granted") return;
    if (scheduledForRef.current === startedAt) return;

    scheduledForRef.current = startedAt;
    void scheduleSessionNotifications({
      startedAt,
      safeLimitMinutes,
      flipIntervalMinutes,
      hydrationIntervalMinutes,
    });
  }, [
    enabled,
    startedAt,
    permission,
    safeLimitMinutes,
    flipIntervalMinutes,
    hydrationIntervalMinutes,
  ]);

  React.useEffect(() => {
    if (!enabled) return;
    void setAppBadge(Math.max(0, Math.ceil(remainingMinutes)));
  }, [enabled, remainingMinutes]);

  const clearSessionAlerts = React.useCallback(() => {
    scheduledForRef.current = null;
    void cancelScheduledSessionNotifications();
    void clearAppBadge();
  }, []);

  React.useEffect(() => {
    return () => {
      void clearAppBadge();
    };
  }, []);

  return {
    supported: notificationsSupported(),
    permission,
    enableAlerts,
    clearSessionAlerts,
  };
}
