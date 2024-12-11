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
  "./src/js/managers/DatabaseManager.js",
  "./src/js/managers/ReminderManager.js",
  "./src/js/services/ApiService.js",
  "./src/js/services/SyncService.js",
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

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) {
        clientList[0].focus();
      }
    })
  );
});

// Message handling for reminders
self.addEventListener("message", (event) => {
  if (event.data.type === "SET_REMINDER") {
    const { time, message } = event.data;
    const scheduledTime = new Date(time).getTime();

    console.log(
      "Reminder scheduled for:",
      new Date(scheduledTime).toLocaleString()
    );

    if (isNaN(scheduledTime)) {
      console.error("Invalid reminder time");
      return;
    }

    const delay = scheduledTime - Date.now();
    if (delay < 0) {
      console.error("Cannot schedule reminder in the past");
      return;
    }

    setTimeout(() => {
      self.registration.showNotification("StudySync Reminder", {
        body: message || "Time to study!",
        requireInteraction: true,
        icon: "./favicon.ico",
        badge: "./favicon.ico",
      });
    }, delay);
  }
});
