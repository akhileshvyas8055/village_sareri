import { createHash } from "crypto";
import { getAdminServices } from "../server/firebaseAdmin.js";
import { getSafeNotificationUrl } from "../server/notificationService.js";

const asDate = (value) => {
  if (!value) return null;
  const parsed = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

  try {
    const { firestore, FieldPath } = getAdminServices();
    const notifications = [];
    let cursor = null;

    while (true) {
      let query = firestore.collection("notifications")
        .orderBy(FieldPath.documentId())
        .limit(500);
      if (cursor) query = query.startAfter(cursor);
      const snapshot = await query.get();
      if (snapshot.empty) break;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status && !["FCM Accepted", "Partially Failed"].includes(data.status)) return;
        if (typeof data.title !== "string" || !data.title.trim()) return;

        const createdAt = asDate(data.sentAt || data.createdAt || data.timestamp);
        let url = "/";
        try {
          url = getSafeNotificationUrl(data.destinationUrl || data.link || "/");
        } catch {
          // A legacy record with an unsafe destination opens the portal home page.
        }

        notifications.push({
          id: createHash("sha256").update(doc.id).digest("hex").slice(0, 20),
          title: data.title.trim().slice(0, 120),
          body: typeof data.body === "string" ? data.body.trim().slice(0, 2000) : "",
          type: typeof data.type === "string" ? data.type.slice(0, 80) : "Village update",
          createdAt: createdAt?.toISOString() || null,
          url,
        });
      });

      cursor = snapshot.docs[snapshot.docs.length - 1];
      if (snapshot.size < 500) break;
    }

    notifications.sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Public notification inbox failed:", error?.code || "unknown");
    return res.status(500).json({ success: false, error: "The notification inbox is temporarily unavailable." });
  }
}
