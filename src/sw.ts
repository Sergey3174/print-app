/// <reference lib="webworker" />

import { precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event: PushEvent) => {
  const data = event.data?.text() || "Test notification";

  event.waitUntil(
    self.registration.showNotification("PWA Test", {
      body: data,
      icon: "/android-chrome-192x192.png",
    }),
  );
});
