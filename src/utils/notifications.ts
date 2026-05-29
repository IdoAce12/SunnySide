/**
 * Background notification service for active sunbathing sessions.
 *
 * Uses the PWA service worker to surface lock-screen notifications. When the
 * browser supports Notification Triggers (`TimestampTrigger`) the alerts are
 * scheduled to fire even while the phone is locked / the tab is closed. On
 * browsers without triggers we fall back to in-page timers (fire while the app
 * is alive). The home-screen icon badge is updated via the App Badging API.
 */

export type PermissionState = NotificationPermission | "unsupported";

const TAG_PREFIX = "sunnyside-session";
const fallbackTimers: number[] = [];

export interface SessionNotificationPlan {
  /** Epoch ms when the session started. */
  startedAt: number;
  /** Capped safe-exposure limit in minutes (session end). */
  safeLimitMinutes: number;
  /** Flip cadence in minutes. */
  flipIntervalMinutes: number;
}

interface PlannedEvent {
  at: number;
  title: string;
  body: string;
  tag: string;
  action: string;
  requireInteraction?: boolean;
}

export function notificationsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export function currentPermission(): PermissionState {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (!notificationsSupported()) return "unsupported";
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return Notification.permission;
  }
}

export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing) return existing;
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

function supportsTriggers(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "showTrigger" in Notification.prototype
  );
}

function buildEvents(plan: SessionNotificationPlan): PlannedEvent[] {
  const { startedAt, safeLimitMinutes, flipIntervalMinutes } = plan;
  const events: PlannedEvent[] = [];

  // Flip reminders only — no periodic hydration / text-update chatter.
  for (let k = 1; k * flipIntervalMinutes < safeLimitMinutes; k += 1) {
    events.push({
      at: startedAt + k * flipIntervalMinutes * 60_000,
      title: "Time to flip!",
      body: "Turn over to balance your exposure.",
      tag: `${TAG_PREFIX}-flip-${k}`,
      action: "flip",
    });
  }

  // Session complete — the only other alert.
  events.push({
    at: startedAt + safeLimitMinutes * 60_000,
    title: "Sun Plan Complete",
    body: "Please move to the shade now.",
    tag: `${TAG_PREFIX}-finish`,
    action: "shade",
    requireInteraction: true,
  });

  return events;
}

function notificationOptions(event: PlannedEvent): NotificationOptions {
  const isFinish = event.action === "shade";
  return {
    body: event.body,
    tag: event.tag,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    // High-priority + actionable: wake the screen and require a tap.
    requireInteraction: event.requireInteraction ?? false,
    renotify: true,
    silent: false,
    vibrate: isFinish ? [200, 100, 200, 100, 300] : [200, 100, 200],
    actions: [
      isFinish
        ? { action: "shade", title: "Move to shade" }
        : { action: "flip", title: "Flipped" },
    ],
    data: { url: "/session" },
  };
}

/** Schedule the full set of session notifications. Clears any previous plan. */
export async function scheduleSessionNotifications(
  plan: SessionNotificationPlan,
): Promise<void> {
  if (currentPermission() !== "granted") return;
  const registration = await ensureServiceWorker();
  if (!registration) return;

  await cancelScheduledSessionNotifications();

  const now = Date.now();
  const events = buildEvents(plan).filter((e) => e.at > now + 1_000);
  const useTriggers = supportsTriggers();

  for (const event of events) {
    const options = notificationOptions(event);
    if (useTriggers) {
      options.showTrigger = new TimestampTrigger(event.at);
      try {
        await registration.showNotification(event.title, options);
      } catch {
        /* ignore individual scheduling failures */
      }
    } else {
      const delay = event.at - now;
      const id = window.setTimeout(() => {
        void registration.showNotification(event.title, options);
      }, delay);
      fallbackTimers.push(id);
    }
  }
}

/** Cancel all scheduled/visible session notifications and pending fallbacks. */
export async function cancelScheduledSessionNotifications(): Promise<void> {
  while (fallbackTimers.length > 0) {
    const id = fallbackTimers.pop();
    if (id !== undefined) window.clearTimeout(id);
  }

  const registration = await ensureServiceWorker();
  if (!registration) return;
  try {
    const notes = await registration.getNotifications({
      includeTriggered: true,
    } as GetNotificationOptions);
    notes
      .filter((n) => typeof n.tag === "string" && n.tag.startsWith(TAG_PREFIX))
      .forEach((n) => n.close());
  } catch {
    /* getNotifications unsupported — nothing to clear */
  }
}

export async function setAppBadge(count: number): Promise<void> {
  try {
    if (navigator.setAppBadge) {
      await navigator.setAppBadge(Math.max(0, Math.round(count)));
    }
  } catch {
    /* badging unsupported */
  }
}

export async function clearAppBadge(): Promise<void> {
  try {
    if (navigator.clearAppBadge) {
      await navigator.clearAppBadge();
    }
  } catch {
    /* badging unsupported */
  }
}
