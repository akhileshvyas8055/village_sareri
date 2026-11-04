import { getAdminServices, verifyPanelAdmin } from "../server/firebaseAdmin.js";
import { getNotificationDashboardData } from "../server/notificationService.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  let admin;
  try {
    admin = await verifyPanelAdmin(req);
  } catch (error) {
    console.error("Notification dashboard authentication failed:", error?.code || "unknown");
    return res.status(500).json({ success: false, error: "Notification dashboard is unavailable." });
  }

  if (admin.error) {
    return res.status(admin.status).json({ success: false, error: admin.error });
  }

  try {
    const { firestore, FieldPath } = getAdminServices();
    const dashboard = await getNotificationDashboardData(firestore, FieldPath);
    return res.status(200).json({ success: true, ...dashboard });
  } catch (error) {
    console.error("Notification dashboard failed:", error?.code || "unknown");
    return res.status(500).json({ success: false, error: "Notification dashboard could not be loaded." });
  }
}
