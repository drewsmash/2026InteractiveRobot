const CACHE_NAME = 'rt59-viewer-v4';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Aggressively clean up old corrupted caches when the SW updates
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    const isRangeRequest = event.request.headers.has('range');
    const isBinaryModel = requestUrl.pathname.endsWith('.glb') || requestUrl.pathname.endsWith('.gltf');

    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    // Large 3D assets should come straight from the network. Caching partial/range
    // responses can corrupt subsequent full-file loads in Safari/model-viewer.
    if (isRangeRequest || isBinaryModel) {
        return;
    }

    // Network-First Strategy: Always fetch fresh code, fall back to cache if offline
    event.respondWith(
        fetch(event.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
                if (event.request.method === 'GET' && event.request.url.startsWith('http') && networkResponse.ok) {
                    cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            });
        }).catch(() => {
            return caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                if (event.request.mode === 'navigate') {
                    return new Response('Offline', { status: 503, statusText: 'Offline' });
                }
                return Response.error();
            });
        })
    );
});
