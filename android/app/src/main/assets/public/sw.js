const CACHE_NAME = 'naitix-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use map with try/catch block or promise tracking so a single failure (like missing files or offline) doesn't abort installation
      return Promise.all(
        ASSETS_TO_CACHE.map(async (url) => {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn(`[Service Worker] Failed to cache: ${url}`, err);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '✦ NAITIX', {
      body: data.body || '⟩» Scheduled: Automated reminder is active.',
      icon: '/Logo.png',
      badge: '/Logo.png',
      image: '/Logo.png',
      vibrate: [200, 100, 200, 100, 300],
      tag: data.tag || 'naitix-reminder',
      renotify: true,
      timestamp: Date.now(),
      requireInteraction: true,
      data: { url: data.url || '/reminders' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Find a client with same origin
      const matchingClient = clientList.find(c => {
        try {
          return new URL(c.url).origin === self.location.origin;
        } catch(e) {
          return false;
        }
      });
      
      if (matchingClient) {
        if ('focus' in matchingClient) {
          matchingClient.focus();
        }
        if ('navigate' in matchingClient && targetUrl !== '/') {
          matchingClient.navigate(targetUrl);
        }
        return;
      }
      
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
