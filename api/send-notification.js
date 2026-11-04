import { randomUUID } from "crypto";
import { getAdminServices, verifyPanelAdmin } from "../server/firebaseAdmin.js";
import {
  claimNotificationRecord,
  enforceNotificationRateLimit,
  getSafeNotificationUrl,
  sendNotificationRecord,
} from "../server/notificationService.js";

const audiences = new Set(["all", "android", "ios", "desktop"]);
const requestIdPattern = /^[A-Za-z0-9_-]{12,80}$/;

const getValidatedPayload = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "A JSON request body is required." };
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const messageBody = typeof body.body === "string" ? body.body.trim() : "";
  const type = typeof body.type === "string" && body.type.trim()
    ? body.type.trim()
    : "General";
  const audience = typeof body.audience === "string" ? body.audience : "all";

  if (!title || title.length > 120) return { error: "Title must be between 1 and 120 characters." };
  if (!messageBody || messageBody.length > 2000) return { error: "Message must be between 1 and 2000 characters." };
  if (type.length > 80) return { error: "Notification category is too long." };
  if (!audiences.has(audience)) return { error: "The selected audience is not supported." };

  let url;
  try {
    url = getSafeNotificationUrl(body.link || body.url || "/");
  } catch (error) {
    return { error: error.message };
  }

  const requestedId = typeof body.requestId === "string" ? body.requestId : "";
  if (requestedId && !requestIdPattern.test(requestedId)) {
    return { error: "The request id is invalid." };
  }

  return {
    title,
    body: messageBody,
    type,
    audience,
    url,
    requestId: requestedId || randomUUID(),
  };
};

const toPublicResult = (record, extra = {}) => ({
  success: (record.fcmAcceptedCount || 0) > 0,
  status: record.status || "Processing",
  totalTargetedDevices: record.totalTargetedDevices || 0,
  fcmAcceptedCount: record.fcmAcceptedCount || 0,
  failedCount: record.failedCount || 0,
  invalidTokenCount: record.invalidTokenCount || 0,
  deliveryConfirmed: false,
  errors: record.failureCodes || (record.errorSummary ? { summary: record.errorSummary } : {}),
  ...extra,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  let admin;
  let claimedNotificationRef;
  try {
    admin = await verifyPanelAdmin(req);
  } catch (error) {
    console.error("Notification authentication setup failed:", error?.code || "unknown");
    return res.status(500).json({ success: false, error: "Notification service is unavailable." });
  }

  if (admin.error) {
    return res.status(admin.status).json({ success: false, error: admin.error });
  }

  const payload = getValidatedPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ success: false, error: payload.error });
  }

  try {
    const services = getAdminServices();
    const allowed = await enforceNotificationRateLimit(services.firestore, admin.uid);
    if (!allowed) {
      return res.status(429).json({ success: false, error: "Too many notification requests. Please wait and try again." });
    }

    const notificationId = `${admin.uid}_${payload.requestId}`;
    const timestamp = services.FieldValue.serverTimestamp();
    const claim = await claimNotificationRecord(services.firestore, notificationId, {
      title: payload.title,
      body: payload.body,
      type: payload.type,
      targetAudience: payload.audience,
      destinationUrl: payload.url,
      status: "Processing",
      totalTargetedDevices: 0,
      fcmAcceptedCount: 0,
      failedCount: 0,
      invalidTokenCount: 0,
      deliveryConfirmed: false,
      createdAt: timestamp,
      timestamp,
      createdByUid: admin.uid,
      createdByLabel: admin.displayName || admin.email || "Village administrator",
    });
    claimedNotificationRef = claim.notificationRef;

    if (!claim.claimed) {
      const existing = claim.existing || {};
      if (existing.status === "Processing") {
        return res.status(409).json({
          ...toPublicResult(existing, { duplicate: true }),
          error: "This notification request is already being processed.",
        });
      }
      return res.status(200).json(toPublicResult(existing, { duplicate: true }));
    }

    const result = await sendNotificationRecord({
      firestore: services.firestore,
      FieldPath: services.FieldPath,
      messaging: services.messaging,
      notificationRef: claim.notificationRef,
      notificationId,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      url: payload.url,
      audience: payload.audience,
    });

    const responseStatus = result.fcmAcceptedCount === 0
      ? result.totalTargetedDevices === 0 ? 409 : 502
      : result.failedCount > 0 ? 207 : 200;

    return res.status(responseStatus).json(toPublicResult(result));
  } catch (error) {
    console.error("Notification send failed:", error?.code || "unknown");
    if (claimedNotificationRef) {
      try {
        await claimedNotificationRef.update({
          status: "Failed",
          errorSummary: "Notification processing failed; FCM device delivery is unconfirmed.",
          deliveryConfirmed: false,
          sentAt: new Date(),
        });
      } catch {
        // Preserve the generic API response even when Firestore is unavailable.
      }
    }
    return res.status(500).json({
      success: false,
      status: "Failed",
      error: "The notification could not be processed. Check the notification history for details.",
      deliveryConfirmed: false,
    });
  }
}
