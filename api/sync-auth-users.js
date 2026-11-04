import { getAdminServices, verifyPanelAdmin } from "../server/firebaseAdmin.js";

const PAGE_SIZE = 200;
const PAGE_TOKEN_PATTERN = /^[A-Za-z0-9_./+=:-]{1,4096}$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  let panelAdmin;
  try {
    panelAdmin = await verifyPanelAdmin(req);
  } catch (error) {
    console.error("Auth user sync authentication failed:", error?.code || "unknown");
    return res.status(500).json({ success: false, error: "User sync service is unavailable." });
  }

  if (panelAdmin.error) {
    return res.status(panelAdmin.status).json({ success: false, error: panelAdmin.error });
  }
  if (panelAdmin.role !== "admin") {
    return res.status(403).json({ success: false, error: "Only a main administrator can sync Auth users." });
  }

  const pageToken = typeof req.body?.pageToken === "string" ? req.body.pageToken : undefined;
  if (pageToken && !PAGE_TOKEN_PATTERN.test(pageToken)) {
    return res.status(400).json({ success: false, error: "The page token is invalid." });
  }

  try {
    const { auth, firestore, FieldValue } = getAdminServices();
    const page = await auth.listUsers(PAGE_SIZE, pageToken);
    const userRefs = page.users.map((user) => firestore.collection("users").doc(user.uid));
    const existingSnapshots = userRefs.length ? await firestore.getAll(...userRefs) : [];
    const batch = firestore.batch();
    let created = 0;
    let updated = 0;

    page.users.forEach((authUser, index) => {
      const userRef = userRefs[index];
      const snapshot = existingSnapshots[index];
      const authProfile = {
        uid: authUser.uid,
        email: authUser.email || "",
        displayName: authUser.displayName || "",
        photoURL: authUser.photoURL || "",
        creationTime: authUser.metadata.creationTime || "",
        lastSignInTime: authUser.metadata.lastSignInTime || "",
      };

      if (!snapshot.exists) {
        batch.set(userRef, { ...authProfile, authSyncedAt: FieldValue.serverTimestamp() }, { merge: true });
        created += 1;
        return;
      }

      const existing = snapshot.data() || {};
      const missingProfileFields = Object.fromEntries(
        Object.entries(authProfile).filter(([key, value]) => key !== "uid" && !existing[key] && value)
      );
      if (Object.keys(missingProfileFields).length) {
        batch.set(userRef, {
          ...missingProfileFields,
          authSyncedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        updated += 1;
      }
    });

    if (created + updated > 0) await batch.commit();

    return res.status(200).json({
      success: true,
      processed: page.users.length,
      created,
      updated,
      unchanged: page.users.length - created - updated,
      nextPageToken: page.pageToken || null,
    });
  } catch (error) {
    console.error("Firebase Auth user sync failed:", error?.code || "unknown");
    return res.status(500).json({ success: false, error: "Firebase Auth users could not be copied to Firestore." });
  }
}
