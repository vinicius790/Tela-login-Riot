/**
 * sw.js - Service Worker for Riot Games Client Portal & Esports Suite
 * Cache Version: riot-portal-v2
 * Provides seamless offline caching for all static assets, UI icons, Web Audio,
 * canvas engines, and external Google Fonts.
 */

const CACHE_NAME = 'riot-portal-v2';

const PRECACHE_ASSETS = [
  './',
  './index/index.html',
  './index/trembolona.html',
  './index/account-settings.html',
  './index/bodyfit.html',
  './manifest.json',
  './style/GH.css',
  './style/animations.css',
  './style/themes.css',
  './style/account-settings.css',
  './style/Termogenico.css',
  './assets/Logo.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable.png',
  './assets/icon.svg',
  './js/icons.js',
  './js/audio.js',
  './js/auth.js',
  './js/confetti.js',
  './js/Durateston.js',
  './js/i18n.js',
  './js/mock-auth.js',
  './js/particles.js',
  './js/riot-security.js',
  './js/shortcuts.js',
  './js/theme-switcher.js',
  './js/Creatina.js',
  './js/riot-cursor.js'
];

// External hostnames to runtime-cache for complete offline immersion
const RUNTIME_CACHE_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com'
];

/* ==========================================================================
   1. INSTALL EVENT — Precaches core app shell
   ========================================================================== */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use individual puts to ensure one missing file doesn't break precaching
      return Promise.allSettled(
        PRECACHE_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[SW ${CACHE_NAME}] Precaching notice for ${asset}:`, err.message);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

/* ==========================================================================
   2. ACTIVATE EVENT — Purges obsolete caches & claims clients
   ========================================================================== */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log(`[SW] Deleting legacy cache: ${key}`);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

/* ==========================================================================
   3. FETCH EVENT — Cache-First with Network Fallback & Runtime Caching
   ========================================================================== */
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET and browser-internal schemes
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // Strategy A: Runtime Cache for External Fonts & CDNs
  if (RUNTIME_CACHE_HOSTS.some((host) => url.hostname.includes(host))) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);
      })
    );
    return;
  }

  // Strategy B: App Shell & Local Assets — Cache-First, fallback to Network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background for stale-while-revalidate on navigation/HTML
        if (request.mode === 'navigate') {
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
        }
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Offline fallback for HTML navigation
          if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
            return caches.match('./index/index.html');
          }
        });
    })
  );
});

/* ==========================================================================
   4. MESSAGE EVENT — Immediate skipWaiting trigger
   ========================================================================== */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
