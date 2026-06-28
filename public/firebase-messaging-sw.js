importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// Use the exact same config as in your firebase.js
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

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.data?.title || 'Brahmano Ki Sareri Update';
  const notificationOptions = {
    body: payload.data?.body || 'You have a new message from the village.',
    icon: payload.data?.icon || '/photos/About.jpeg',
    badge: payload.data?.icon || '/photos/About.jpeg',
    image: payload.data?.image || '/photos/About.jpeg',
    requireInteraction: true,
    data: {
      url: payload.data?.link || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to open the app
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Add a dummy fetch listener to satisfy PWA installability requirements
self.addEventListener('fetch', (event) => {
  // Can be left empty or used for offline caching later
});
