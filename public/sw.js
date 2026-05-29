/* SunnySide service worker — background notifications & lock-screen presence. */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* Dismiss-style actions ("Flipped" / "Move to shade") just close the alert. */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "flip" || event.action === "shade") {
    // Acknowledge silently; no need to bring the app forward.
    return;
  }

  const url =
    (event.notification.data && event.notification.data.url) || "/session";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(url).catch(() => {});
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
        return undefined;
      }),
  );
});

/* Optional server push support (no-op without a push backend, kept for parity). */
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (err) {
    payload = { title: "SunnySide", body: event.data ? event.data.text() : "" };
  }
  const title = payload.title || "SunnySide";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "",
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: payload.data || { url: "/session" },
      requireInteraction: Boolean(payload.requireInteraction),
    }),
  );
});
