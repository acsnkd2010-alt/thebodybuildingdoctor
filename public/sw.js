// Minimal service worker – satisfies requests to /sw.js and does nothing.
// Remove this file if you add a real PWA service worker elsewhere.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
