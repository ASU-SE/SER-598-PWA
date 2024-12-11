// Cache configuration
const CACHE_NAME = "studysync-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./src/js/app.js",
  "./manifest.json",
  "./favicon.ico",
  "./src/js/managers/FlashcardManager.js",
  "./src/js/services/ApiService.js",
];

// Installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      self.skipWaiting(),
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
    ])
  );
});

// Activation
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
    ])
  );
});

// Fetch handling
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request).then((response) => {
        if (response.ok && response.url.startsWith(self.location.origin)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});
