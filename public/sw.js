// public/sw.js
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      // Usando os ícones que você já configurou no manifest.ts!
      icon: '/icon-192x192.png', 
      badge: '/icon-light-32x32.png',
      vibrate: [200, 100, 200, 100, 200, 100, 200], // Vibração de desespero (opcional kkk)
      data: {
        url: data.url || '/',
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});