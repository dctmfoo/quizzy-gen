// This is a minimal service worker for development
// It doesn't actually do anything but prevents 404 errors

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle the request normally
  event.respondWith(fetch(event.request));
}); 