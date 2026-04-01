const CACHE_NAME = 'rt59-viewer-v3';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
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

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    if (event.request.method === 'GET' && event.request.url.startsWith('http') && networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Offline'
                    });
                }

                return Response.error();
            });
        })
    );
});
