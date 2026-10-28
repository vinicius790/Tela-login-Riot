/**
 * Root Service Worker Proxy for Riot Games Client Portal
 * Provides top-level scope ("/") caching and intercepts all requests across /index, /js, /style, /assets
 */
self.importScripts('./js/sw.js');
