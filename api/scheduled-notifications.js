import { getAdminServices, verifyPanelAdmin } from "../server/firebaseAdmin.js";
import { enforceNotificationRateLimit } from "../server/notificationService.js";
import {
  createScheduledNotification,
  listScheduledNotifications,
  serializeScheduledNotification,
  updateScheduledNotification,
  validateScheduledPayload,
} from "../server/scheduledNotifications.js";

const idPattern = /^[A-Za-z0-9_-]{1,128}$/;

export default async function handler(req, res) {
  if (!new Set(["GET", "POST", "PATCH"]).has(req.method)) {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  let admin;
  try {
    admin = await verifyPanelAdmin(req);
  } catch (error) {
    console.error("Scheduled notification authentication failed:", error?.code || "unknown");
    return res.status(500).json({ success: false, error: "Scheduling service is unavailable." });
  }
  if (admin.error) return res.status(admin.status).json({ success: false, error: admin.error });

  try {
    const services = getAdminServices();
    if (req.method === "GET") {
      const scheduled = await listScheduledNotifications(services.firestore, services.FieldPath);
      return res.status(200).json({ success: true, scheduled });
    }

    if (req.method === "POST") {
      const payload = validateScheduledPayload(req.body);
      if (payload.error) return res.status(400).json({ success: false, error: payload.error });

      const allowed = await enforceNotificationRateLimit(services.firestore, admin.uid);
      if (!allowed) return res.status(429).json({ success: false, error: "Too many scheduling requests. Please wait and try again." });

      const result = await createScheduledNotification({
        firestore: services.firestore,
        FieldValue: services.FieldValue,
        admin,
        payload,
      });
      return res.status(result.created ? 201 : 200).json({ success: true, ...result });
    }

    const { id, action } = req.body || {};
    if (typeof id !== "string" || !idPattern.test(id)) {
      return res.status(400).json({ success: false, error: "A valid scheduled notification id is required." });
    }

    let payload;
    if (action === "edit") {
      payload = validateScheduledPayload(req.body);
      if (payload.error) return res.status(400).json({ success: false, error: payload.error });
    }

    const result = await updateScheduledNotification({
      firestore: services.firestore,
      FieldValue: services.FieldValue,
      id,
      admin,
      action,
      payload,
    });
    if (result.error) return res.status(result.status).json({ success: false, error: result.error });
    return res.status(result.status).json({ success: true, item: serializeScheduledNotification(id, result.item) });
  } catch (error) {
    console.error("Scheduled notification operation failed:", error?.code || "unknown");
    return res.status(500).json({ success: false, error: "Scheduled notification could not be processed." });
  }
}
