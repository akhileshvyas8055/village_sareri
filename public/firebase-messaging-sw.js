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

// Let Firebase handle background messages automatically using the standard notification payload.
// Do NOT add onBackgroundMessage here, otherwise it will result in double notifications!

// Add a dummy fetch listener to satisfy PWA installability requirements
self.addEventListener('fetch', (event) => {
  // Can be left empty or used for offline caching later
});
