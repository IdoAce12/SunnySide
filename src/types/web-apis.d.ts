/**
 * Ambient declarations for progressive web APIs not yet in the standard TS lib:
 *  - Notification Triggers (`TimestampTrigger`, `showTrigger`) — background-capable
 *    scheduled notifications that fire even when the tab is closed / phone locked.
 *  - App Badging (`navigator.setAppBadge` / `clearAppBadge`) — home-screen icon badge.
 */
export {};

declare global {
  /** Schedules a notification to display at an absolute epoch timestamp. */
  class TimestampTrigger {
    constructor(timestamp: number);
  }

  interface NotificationOptions {
    showTrigger?: TimestampTrigger;
  }

  interface GetNotificationOptions {
    includeTriggered?: boolean;
  }

  interface Navigator {
    setAppBadge?: (contents?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  }
}
