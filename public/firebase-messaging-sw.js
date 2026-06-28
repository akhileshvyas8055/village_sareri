importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyBE6p3W-LHKYxHrMB4gEbiS5chmCS-764s",
  authDomain: "sareri-website.firebaseapp.com",
  projectId: "sareri-website",
  storageBucket: "sareri-website.firebasestorage.app",
  messagingSenderId: "350526736466",
  appId: "1:350526736466:web:60576d8da3e6258a9e378b"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Extract data from standard or data-only payload
  const title = payload.notification?.title || payload.data?.title || 'Village Alert';
  const body = payload.notification?.body || payload.data?.body || 'New message from the village.';
  const image = payload.notification?.image || payload.data?.image || '/photos/About.jpeg';
  const icon = payload.data?.icon || '/photos/About.jpeg';
  const link = payload.data?.link || payload.fcmOptions?.link || '/';

  const notificationOptions = {
    body: body,
    icon: icon,
    badge: icon,
    image: image,
    requireInteraction: true,
    data: { url: link }
  };

  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});

self.addEventListener('fetch', (event) => {});
