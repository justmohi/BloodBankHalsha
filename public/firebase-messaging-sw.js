// Blood Bank Halsha - Web Push Service Worker
/* eslint-disable no-undef */

// Handle Background Push Event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Blood Bank Halsha';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'New update regarding blood requests.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: payload.data?.click_action || payload.data?.url || '/notifications',
        requestId: payload.data?.requestId || null
      },
      tag: payload.data?.tag || 'blood-bank-halsha-notice',
      renotify: true
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  } catch (err) {
    // Text payload fallback
    const title = 'Blood Bank Halsha';
    const options = {
      body: event.data.text(),
      icon: '/favicon.ico',
      data: { url: '/notifications' }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// Handle Notification Click Navigation
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
