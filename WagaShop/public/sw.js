const CACHE_VERSION = 'v2.1.0';
const CACHE_STATIC_NAME = `waga-static-${CACHE_VERSION}`;
const CACHE_ICONS_NAME = `waga-icons-${CACHE_VERSION}`;
const CACHE_IMAGES_NAME = `waga-product-assets-${CACHE_VERSION}`;
const CACHE_FONTS_NAME = `waga-fonts-${CACHE_VERSION}`;

// Core UI icons and Shell Assets to precache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/waga-logo.png',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png'
];

// Maximum cached product images to prevent filling device storage
const MAX_IMAGE_ENTRIES = 200;

// Helper: Trim cache to limit max entries
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      const itemsToDelete = keys.slice(0, keys.length - maxItems);
      for (const item of itemsToDelete) {
        await cache.delete(item);
      }
    }
  } catch (err) {
    console.debug('Error trimming cache:', err);
  }
}

// 1. Service Worker Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Some precache assets could not be cached immediately:', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Service Worker Activate: Clean up previous cache versions
self.addEventListener('activate', (event) => {
  const currentCaches = [
    CACHE_STATIC_NAME,
    CACHE_ICONS_NAME,
    CACHE_IMAGES_NAME,
    CACHE_FONTS_NAME
  ];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[SW] Removing deprecated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event Routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension / non-http schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // A. Navigation / Page Routes (HTML SPA Navigation fallback)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_STATIC_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // B. UI Icons and Brand Logos (Cache-First with Background Update)
  const isUIIcon = 
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.includes('icon-') ||
    url.pathname.includes('waga-logo') ||
    url.pathname.includes('favicon') ||
    (url.origin === self.location.origin && url.pathname.match(/\.(png|jpg|jpeg|webp)$/i));

  if (isUIIcon) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_ICONS_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // C. Product Listing Assets (Firebase Storage, Unsplash, ImgBB, External Image CDNs)
  const isProductImage = 
    request.destination === 'image' ||
    url.hostname.includes('firebasestorage.googleapis.com') ||
    url.hostname.includes('storage.googleapis.com') ||
    url.hostname.includes('images.unsplash.com') ||
    url.hostname.includes('i.ibb.co') ||
    url.hostname.includes('cloudinary.com');

  if (isProductImage) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache instantly, fetch in background for fresh asset
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_IMAGES_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                  trimCache(CACHE_IMAGES_NAME, MAX_IMAGE_ENTRIES);
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Not in cache: fetch and store
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              const copy = networkResponse.clone();
              caches.open(CACHE_IMAGES_NAME).then((cache) => {
                cache.put(request, copy);
                trimCache(CACHE_IMAGES_NAME, MAX_IMAGE_ENTRIES);
              });
            }
            return networkResponse;
          })
          .catch(async () => {
            // Fallback to local brand logo if product image request fails offline
            return caches.match('/waga-logo.png');
          });
      })
    );
    return;
  }

  // D. Google Fonts / External CDNs (Cache-First)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_FONTS_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // E. JS, CSS, and Static Assets (Stale-While-Revalidate)
  if (
    url.pathname.includes('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_STATIC_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // F. Default Fetch with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
