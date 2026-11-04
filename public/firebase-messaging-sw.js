importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyBE6p3W-LHKYxHrMB4gEbiS5chmCS-764s",
  authDomain: "sareri-website.firebaseapp.com",
  projectId: "sareri-website",
  storageBucket: "sareri-website.firebasestorage.app",
  messagingSenderId: "350526736466",
  appId: "1:350526736466:web:60576d8da3e6258a9e378b",
};

// Register the app-owned click handler before initializing Messaging so it
// takes precedence over the SDK's default click behavior.
self.addEventListener("notificationclick", (event) => {
  event.stopImmediatePropagation();
  event.notification.close();

  let targetUrl;
  try {
    const rawUrl = event.notification.data?.url || event.notification.data?.link || "/";
    const parsedUrl = new URL(rawUrl, self.location.origin);
    targetUrl = parsedUrl.origin === self.location.origin
      ? parsedUrl.href
      : new URL("/", self.location.origin).href;
  } catch {
    targetUrl = new URL("/", self.location.origin).href;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clientList) => {
      const appClient = clientList.find((client) => {
        try {
          return new URL(client.url).origin === self.location.origin;
        } catch {
          return false;
        }
      });

      if (appClient) {
        if ("navigate" in appClient && appClient.url !== targetUrl) {
          await appClient.navigate(targetUrl);
        }
        return appClient.focus();
      }

      if (clients.openWindow) return clients.openWindow(targetUrl);
    }),
  );
});

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(() => {
  // FCM displays notification payloads while the app is in the background.
  // Keeping this handler free of showNotification() avoids a second display.
});
