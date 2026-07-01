const CACHE = "mantra-mandiram-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/transliteration.js",
  "./js/content.js",
  "./js/app.compiled.js",
  "./js/vendor/react.production.min.js",
  "./js/vendor/react-dom.production.min.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var fetchPromise = fetch(event.request)
        .then(function (networkResponse) {
          if (networkResponse && networkResponse.ok) {
            var copy = networkResponse.clone();
            caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
          }
          return networkResponse;
        })
        .catch(function () { return cached; });
      return cached || fetchPromise;
    })
  );
});
