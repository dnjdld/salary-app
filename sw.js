// Bump this version string whenever the app files change.
// It only controls which files are cached for OFFLINE use —
// it has no connection to localStorage, so your saved budget
// data is never affected by an app update.
const CACHE_NAME = 'salary-ledger-shell-v1';
const PRECACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Network-first for the app shell: if you're online, you always get the
// latest version of the app. If you're offline, you get the last cached
// copy. Either way, your data (in localStorage) lives outside this cache
// and is untouched.
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
