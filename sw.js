/* Ramadan Accountability PWA - offline cache */
const CACHE_NAME = "ramadan-pwa-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo-footer.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./zad.pdf"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
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

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((res) => {
          try {
            const url = new URL(event.request.url);
            if (url.origin === self.location.origin) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
          } catch (e) { }
          return res;
        })
        .catch(() => (event.request.mode === "navigate" ? caches.match("./index.html") : undefined));
    })
  );
});
