/* SunnySide service worker — background notifications & lock-screen presence. */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* Focus (or open) the app when a notification is tapped from the lock screen. */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
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
