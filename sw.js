/* Ramadan Accountability PWA - offline cache */
const ZAD_PDF_URL = "https://raw.githubusercontent.com/NaserNajeh/ramazan/main/zad.pdf";
const CACHE_NAME = "ramadan-pwa-v1";
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
    // Pre-cache زاد الذاكر PDF (cross-origin). Cached as opaque response; available offline after first successful fetch.
    try {
      const req = new Request(ZAD_PDF_URL, { mode: "no-cors" });
      const res = await fetch(req);
      await cache.put(req, res);
    } catch (e) {}
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
    // Special-case: serve زاد الذاكر PDF from cache when offline
    if (event.request.url === ZAD_PDF_URL) {
      const cache = await caches.open(CACHE_NAME);
      const cachedPdf = await cache.match(ZAD_PDF_URL);
      if (cachedPdf) return cachedPdf;
    }
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const res = await fetch(event.request);
      try {
        const url = new URL(event.request.url);
        if (url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
      } catch (e) {}
      return res;
    } catch (e) {
      if (event.request.mode === "navigate") return caches.match("./index.html");
      return undefined;
    }
  })());
});
