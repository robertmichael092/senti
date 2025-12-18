const VERSION = 'senti-v3'; // CHANGE VERSION WHENEVER YOU DEPLOY

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll([
      './',
      './index.html',
      './styles.css',
      './app.js',
      './db.js',
      './manifest.json'
    ]))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== VERSION).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
