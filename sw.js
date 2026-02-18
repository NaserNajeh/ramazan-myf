/* Ramadan Accountability PWA - offline cache */
const ZAD_PDF_URL = "https://raw.githubusercontent.com/NaserNajeh/ramazan/main/zad.pdf";
const CACHE_NAME = "ramadan-pwa-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
  })());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith((async () => {
    // 1. Try cache
    const cached = await caches.match(event.request);
    if (cached) return cached;

    // 2. Network fallback
    try {
      const res = await fetch(event.request);

      // Cache valid responses
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return res;
    } catch (e) {
      // 3. Offline fallback for navigation
      if (event.request.mode === "navigate") {
        return caches.match("./index.html");
      }
      return undefined;
    }
  })());
});
