const CACHE_NAME = 'dasa-app-cache-v4'; // Upgraded to v4!

const urlsToCache = [
  './',
  './index.html',
  './songs.js',
  './icon.png',
  './manifest.json'
];

// 1. Install and force the new engine to take over instantly
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. Wipe out ALL old, broken memory files immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Force control of the app right now
});

// 3. Bulletproof Fetching: Always serve index.html if a link gets confused offline
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request).then(response => {
      let responseClone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
      return response;
    }).catch(() => {
      return caches.match(event.request, { ignoreSearch: true }).then(response => {
        // If it finds the file, serve it. If it gets confused, force it to serve the main app!
        return response || caches.match('./index.html');
      });
    })
  );
});