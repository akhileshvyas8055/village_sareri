import { timingSafeEqual } from "crypto";
import { getAdminServices } from "../server/firebaseAdmin.js";
import { processDueScheduledNotifications } from "../server/scheduledNotifications.js";

const isAuthorizedCronRequest = (req) => {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers?.authorization || "";
  if (!secret || !authorization.startsWith("Bearer ")) return false;

  const provided = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }
  if (!process.env.CRON_SECRET) {
    return res.status(503).json({ success: false, error: "Scheduled processing is not configured." });
  }
  if (!isAuthorizedCronRequest(req)) {
    return res.status(401).json({ success: false, error: "Unauthorized cron request." });
  }

  try {
    const services = getAdminServices();
    const result = await processDueScheduledNotifications({
      firestore: services.firestore,
      FieldPath: services.FieldPath,
      FieldValue: services.FieldValue,
      messaging: services.messaging,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Scheduled notification job failed:", error?.code || "unknown");
    return res.status(500).json({ success: false, error: "Scheduled notification job failed." });
  }
}
