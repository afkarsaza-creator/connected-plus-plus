/*
      Welcome to our basic PWA service worker!
      With this service worker, your app will be able to:
        - Work offline
        - Show an offline page if the user is offline and has not visited the page before
      To learn more about service workers, visit https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
    */

    // The name of your cache
    const CACHE_NAME = "cONnectedPlusCache-v1";

    // The files you want to cache
    const PRECACHE_URLS = [
      "/",
      "./index.html",
      "./index.tsx"
    ];

    // The offline page to show when the user is offline
    const OFFLINE_URL = "./index.html";

    // Listen for the install event
    self.addEventListener("install", (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.addAll(PRECACHE_URLS);
        })
      );
    });

    // Listen for the activate event
    self.addEventListener("activate", (event) => {
      // Remove old caches
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== CACHE_NAME) {
                return caches.delete(cacheName);
              }
            })
          );
        })
      );
    });

    // Listen for the fetch event
    self.addEventListener("fetch", (event) => {
      if (event.request.mode === "navigate") {
        event.respondWith(
          (async () => {
            try {
              const preloadResponse = await event.preloadResponse;
              if (preloadResponse) {
                return preloadResponse;
              }

              const networkResponse = await fetch(event.request);
              return networkResponse;
            } catch (error) {
              console.log("Fetch failed; returning offline page instead.", error);

              const cache = await caches.open(CACHE_NAME);
              const cachedResponse = await cache.match(OFFLINE_URL);
              return cachedResponse;
            }
          })()
        );
      } else {
        event.respondWith(
          caches.match(event.request).then((response) => {
            // Return the cached response if it exists
            if (response) {
              return response;
            }

            // If the request is not in the cache, fetch it from the network
            return fetch(event.request);
          })
        );
      }
    });