const CACHE_NAME = 'dasa-app-cache-v7'; // The Bulletproof Version

const urlsToCache = [
  '/',
  '/index.html',
  '/songs.js',
  '/icon.png',
  '/manifest.json'
];

// 1. Install and save files ONE BY ONE so missing files don't crash it
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache v7');
      // This smart loop prevents the whole app from breaking!
      urlsToCache.forEach(url => {
        cache.add(url).catch(err => console.log('Could not cache: ', url));
      });
    })
  );
});

// 2. Wipe out all old, broken memory files immediately
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
  self.clients.claim(); 
});

// 3. Smart Fetching
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request).then(response => {
      let responseClone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
      return response;
    }).catch(() => {
      return caches.match(event.request, { ignoreSearch: true }).then(response => {
        return response || caches.match('/index.html', { ignoreSearch: true }) || caches.match('/', { ignoreSearch: true });
      });
    })
  );
});
