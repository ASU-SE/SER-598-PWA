// Installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      self.skipWaiting()
    ])
  );
});

// Activation
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim()
    ])
  );
});
