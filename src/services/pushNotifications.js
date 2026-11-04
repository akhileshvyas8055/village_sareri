import { getToken } from "firebase/messaging";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, getFirebaseMessaging } from "../firebase";
import { getDevicePlatform } from "../utils/pwa";

// VAPID keys are public Web Push configuration, not server credentials.
const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  "BGJGryvnAKIvBHBdvq644OaBhX37nZ9JsDboA_6IbJErrYhu3qfLwhAiLWrTTlZz6HEU3TMc6gZ69pIyRiGFoTU";

let syncInFlight;

const getBrowserName = () => {
  const userAgent = navigator.userAgent || "";
  if (/Edg\//i.test(userAgent)) return "Edge";
  if (/OPR\//i.test(userAgent)) return "Opera";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/CriOS\//i.test(userAgent) || /Chrome\//i.test(userAgent)) return "Chrome";
  if (/Safari\//i.test(userAgent)) return "Safari";
  return "Other";
};

const syncGrantedPermission = async () => {
  if (
    typeof window === "undefined" ||
    !window.isSecureContext ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    Notification.permission !== "granted"
  ) {
    return { status: "unavailable" };
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) return { status: "unsupported" };

  const serviceWorkerRegistration = await navigator.serviceWorker.ready;
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration,
  });

  if (!token) return { status: "token-unavailable" };

  const tokensRef = collection(db, "fcmTokens");
  const matchingRecords = await getDocs(
    query(tokensRef, where("token", "==", token)),
  );
  const now = serverTimestamp();
  const metadata = {
    platform: getDevicePlatform(),
    browser: getBrowserName(),
    status: "active",
    permission: "granted",
    updatedAt: now,
    lastSeen: now,
  };

  if (matchingRecords.empty) {
    await addDoc(tokensRef, {
      ...metadata,
      token,
      createdAt: now,
    });
  } else {
    const batch = writeBatch(db);
    matchingRecords.docs.forEach((tokenDoc) => {
      batch.update(tokenDoc.ref, metadata);
    });
    await batch.commit();
  }

  return { status: "registered" };
};

export const syncNotificationToken = () => {
  if (!syncInFlight) {
    syncInFlight = syncGrantedPermission().finally(() => {
      syncInFlight = undefined;
    });
  }
  return syncInFlight;
};

// Call only from a user action. Permission is never requested during startup.
export const enableNotificationSubscription = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { status: "unsupported" };
  }

  if (!("serviceWorker" in navigator) || !window.isSecureContext) {
    return { status: "unavailable" };
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") return { status: permission };
  return syncNotificationToken();
};
