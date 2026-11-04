import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

let firebaseAdminApp;

const getFirebaseAdminApp = () => {
  if (firebaseAdminApp) return firebaseAdminApp;
  if (getApps().length) {
    firebaseAdminApp = getApps()[0];
    return firebaseAdminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase server credentials are not configured.");
  }

  firebaseAdminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
    databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
  });
  return firebaseAdminApp;
};

export const getAdminServices = () => {
  const app = getFirebaseAdminApp();
  return {
    auth: getAuth(app),
    realtimeDatabase: getDatabase(app),
    firestore: getFirestore(app),
    messaging: getMessaging(app),
    FieldPath,
    FieldValue,
  };
};

export const verifyPanelAdmin = async (req) => {
  const authorization = req.headers?.authorization || req.headers?.Authorization || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return { error: "unauthorized", status: 401 };

  const { auth, realtimeDatabase, firestore } = getAdminServices();
  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(match[1], true);
  } catch {
    return { error: "unauthorized", status: 401 };
  }

  let role;
  try {
    const roleSnapshot = await realtimeDatabase.ref(`userRoles/${decodedToken.uid}`).get();
    role = roleSnapshot.val()?.role || null;
  } catch {
    // The existing Admin page also falls back to Firestore user documents.
  }

  if (!role) {
    try {
      const userSnapshot = await firestore.collection("users").doc(decodedToken.uid).get();
      role = userSnapshot.data()?.role || null;
    } catch {
      return { error: "authorization_unavailable", status: 503 };
    }
  }

  // Both roles can currently access the notification controls in the existing
  // Admin panel, so preserve that established authorization policy.
  if (role !== "admin" && role !== "sarpanch") {
    return { error: "forbidden", status: 403 };
  }

  return {
    uid: decodedToken.uid,
    email: typeof decodedToken.email === "string" ? decodedToken.email : "",
    displayName: typeof decodedToken.name === "string" ? decodedToken.name : "",
    role,
  };
};
