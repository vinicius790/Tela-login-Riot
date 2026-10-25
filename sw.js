/**
 * sw.js - Service Worker for Riot Games Login Screen
 * Enables offline access and caching of static assets.
 */
const CACHE_NAME = 'riot-client-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './trembolona.html',
  './GH.css',
  './styles/animations.css',
  './styles/themes.css',
  './assets/icons.js',
  './js/audio.js',
  './js/auth.js',
  './js/i18n.js',
  './js/mock-auth.js',
  './js/theme-switcher.js',
  './js/particles.js',
  './js/confetti.js',
  './js/shortcuts.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => cachedResponse);
    })
  );
});