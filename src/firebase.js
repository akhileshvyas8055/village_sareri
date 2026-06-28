// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBE6p3W-LHKYxHrMB4gEbiS5chmCS-764s",
  authDomain: "sareri-website.firebaseapp.com",
  projectId: "sareri-website",
  storageBucket: "sareri-website.firebasestorage.app",
  messagingSenderId: "350526736466",
  appId: "1:350526736466:web:60576d8da3e6258a9e378b",
  measurementId: "G-WRTMYENJS3",
  databaseURL: "https://sareri-website-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const rtdb = getDatabase(app);

let messaging;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});
export { messaging };
