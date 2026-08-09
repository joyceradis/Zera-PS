const CACHE_NAME = 'zera-ps-v6';

const APP_SHELL = [
  './',
  './index.html',
  './app.html',
  './app.js',
  './manifest.json',
  './assets/styles.css',
  './assets/data.js',
  './assets/templates.js',
  './assets/scores.js',
  './assets/clinical-state.js',
  './assets/document-engine.js',
  './assets/storage.js',
  './assets/ui.js',
  './assets/app.js',
  './assets/logo.svg',
  './src/app.js',
  './src/temporal-ui.js',
  './src/context-coordination.js',
  './src/tool-presentation.js',
  './src/clinical-state.js',
  './src/data.js',
  './src/templates.js',
  './src/ui.js',
  './src/storage.js',
  './src/workflow-engine.js',
  './src/score-engine.js',
  './src/document-engine.js',
  './src/protocol-schema.js',
  './src/protocol-engine.js',
  './src/protocol-registry.js',
  './src/protocol-renderer.js',
  './protocols/sca.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const sameOrigin = requestUrl.origin === self.location.origin;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./app.html'))
    );
    return;
  }

  if (!sameOrigin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
