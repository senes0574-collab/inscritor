// Service worker minimal : requis pour l'installation, sans cache (les données restent toujours à jour).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
