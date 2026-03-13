const CACHE_VERSION = 'v2-premium-cache';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Essential assets to cache immediately upon installation
const CORE_ASSETS = [
  '/sribalajimedical/',
  '/sribalajimedical/index.html',
  '/sribalajimedical/appointment.html',
  '/sribalajimedical/manifest.json',
  'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepUP2FX3SGHTVVi9zaGwqcQFwCyNT5DYEFHwu1BfcMrfGAd_6RCgVs6chi1FpCNnPgkDAr57IT-poVLGH3Qwo8GDiV97PRyiy2d3w3Y1soJ4U39Efp1qu00YF0EriKYEvUUiaWobzhNNMQ=s1360-w1360-h1020-rw'
];

// 1. INSTALL EVENT: Pre-cache core assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Precaching Core Assets');
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// 2. ACTIVATE EVENT: Clean up old caches to save user storage space
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. FETCH EVENT: Advanced caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Strategy A: Network-First for HTML/Page Navigations
  // Ensures users always see the latest medical info/status if online
  if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          // If offline, serve the cached page
          return caches.match(request).then((cachedRes) => cachedRes || caches.match('/sribalajimedical/index.html'));
        })
    );
    return;
  }

  // Strategy B: Cache-First, Fallback to Network for Static Assets (Images, Tailwind, APIs)
  // Ensures extremely fast loading speeds
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return instantly from cache
      }
      return fetch(request).then((networkResponse) => {
        // Cache successful network responses dynamically
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch((err) => console.log('[Service Worker] Fetch failed (Offline)', err));
    })
  );
});
