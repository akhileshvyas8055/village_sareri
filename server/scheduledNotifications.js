import { randomUUID } from "crypto";
import { sendNotificationRecord } from "./notificationService.js";

const allowedAudiences = new Set(["all", "android", "ios", "desktop"]);
const requestIdPattern = /^[A-Za-z0-9_-]{12,80}$/;

const getDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const validateScheduledPayload = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "A JSON request body is required." };
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const messageBody = typeof body.body === "string" ? body.body.trim() : "";
  const type = typeof body.type === "string" && body.type.trim() ? body.type.trim() : "General";
  const audience = typeof body.audience === "string" ? body.audience : "all";
  const scheduledAt = getDate(body.scheduledAt);
  const timezone = body.timezone || "Asia/Kolkata";

  if (!title || title.length > 120) return { error: "Title must be between 1 and 120 characters." };
  if (!messageBody || messageBody.length > 2000) return { error: "Message must be between 1 and 2000 characters." };
  if (type.length > 80) return { error: "Notification category is too long." };
  if (!allowedAudiences.has(audience)) return { error: "The selected audience is not supported." };
  if (!scheduledAt || scheduledAt.getTime() <= Date.now()) return { error: "Choose a future date and time." };
  if (timezone !== "Asia/Kolkata") return { error: "Scheduled notifications must use Asia/Kolkata time." };

  let url;
  try {
    url = getSafeNotificationUrl(body.link || body.url || "/");
  } catch (error) {
    return { error: error.message };
  }

  const requestId = typeof body.requestId === "string" ? body.requestId : "";
  if (requestId && !requestIdPattern.test(requestId)) return { error: "The request id is invalid." };

  return { title, body: messageBody, type, audience, url, scheduledAt, timezone, requestId };
};

export const serializeScheduledNotification = (id, data) => ({
  id,
  title: data.title || "",
  body: data.body || "",
  type: data.type || "General",
  audience: data.targetAudience || "all",
  link: data.destinationUrl || "/",
  scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt || null,
  timezone: data.timezone || "Asia/Kolkata",
  status: data.status || "Scheduled",
  createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
});

export const listScheduledNotifications = async (firestore, FieldPath) => {
  const items = [];
  let cursor = null;

  while (true) {
    let query = firestore
      .collection("scheduledNotifications")
      .where("status", "in", ["Scheduled", "Processing"])
      .orderBy(FieldPath.documentId())
      .limit(500);
    if (cursor) query = query.startAfter(cursor);

    const snapshot = await query.get();
    if (snapshot.empty) break;
    snapshot.docs.forEach((doc) => items.push(serializeScheduledNotification(doc.id, doc.data())));
    cursor = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < 500) break;
  }

  return items.sort((a, b) => new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0));
};

export const createScheduledNotification = async ({ firestore, FieldValue, admin, payload }) => {
  const requestId = payload.requestId || randomUUID();
  const id = `${admin.uid}_${requestId}`;
  const ref = firestore.collection("scheduledNotifications").doc(id);
  const timestamp = FieldValue.serverTimestamp();
  const created = await firestore.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists) return { created: false, data: existing.data() };
    transaction.create(ref, {
      title: payload.title,
      body: payload.body,
      type: payload.type,
      targetAudience: payload.audience,
      destinationUrl: payload.url,
      scheduledAt: payload.scheduledAt,
      timezone: payload.timezone,
      status: "Scheduled",
      createdAt: timestamp,
      updatedAt: timestamp,
      createdByUid: admin.uid,
      createdByLabel: admin.displayName || admin.email || "Village administrator",
      executionAttempts: 0,
    });
    return { created: true };
  });

  const saved = created.created ? await ref.get() : null;
  return {
    created: created.created,
    item: serializeScheduledNotification(id, saved?.data() || created.data),
  };
};

export const updateScheduledNotification = async ({ firestore, FieldValue, id, admin, action, payload }) => {
  const ref = firestore.collection("scheduledNotifications").doc(id);
  let result;

  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) {
      result = { status: 404, error: "Scheduled notification not found." };
      return;
    }

    const current = snapshot.data();
    if (current.status !== "Scheduled") {
      result = { status: 409, error: "Only pending notifications can be edited or cancelled." };
      return;
    }

    if (action === "cancel") {
      transaction.update(ref, {
        status: "Cancelled",
        cancelledAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        updatedByUid: admin.uid,
      });
      result = { status: 200, item: { id, ...current, status: "Cancelled" } };
      return;
    }

    if (action !== "edit") {
      result = { status: 400, error: "The requested schedule action is not supported." };
      return;
    }

    transaction.update(ref, {
      title: payload.title,
      body: payload.body,
      type: payload.type,
      targetAudience: payload.audience,
      destinationUrl: payload.url,
      scheduledAt: payload.scheduledAt,
      timezone: payload.timezone,
      updatedAt: FieldValue.serverTimestamp(),
      updatedByUid: admin.uid,
    });
    result = { status: 200, item: { id, ...current, ...payload, targetAudience: payload.audience, destinationUrl: payload.url } };
  });

  return result;
};

const scheduleDate = (value) => value?.toDate?.() || new Date(value);

const claimDueSchedule = async ({ firestore, FieldValue, scheduleRef, historyRef, now }) => {
  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(scheduleRef);
    if (!snapshot.exists) return null;
    const data = snapshot.data();
    if (data.status !== "Scheduled" || scheduleDate(data.scheduledAt).getTime() > now.getTime()) return null;

    const existingHistory = await transaction.get(historyRef);
    if (existingHistory.exists) {
      transaction.update(scheduleRef, {
        status: "Failed",
        lastError: "Notification history already exists; execution was not repeated.",
        executedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return null;
    }

    transaction.update(scheduleRef, {
      status: "Processing",
      startedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      executionAttempts: FieldValue.increment(1),
    });
    transaction.create(historyRef, {
      title: data.title,
      body: data.body,
      type: data.type,
      targetAudience: data.targetAudience || "all",
      destinationUrl: data.destinationUrl || "/",
      status: "Processing",
      totalTargetedDevices: 0,
      fcmAcceptedCount: 0,
      failedCount: 0,
      invalidTokenCount: 0,
      deliveryConfirmed: false,
      createdAt: data.createdAt || FieldValue.serverTimestamp(),
      timestamp: data.createdAt || FieldValue.serverTimestamp(),
      scheduledAt: data.scheduledAt,
      createdByUid: data.createdByUid || "",
      createdByLabel: data.createdByLabel || "Village administrator",
      scheduleId: scheduleRef.id,
    });

    return data;
  });
};

const markStaleProcessingSchedules = async (firestore, FieldValue) => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  const snapshot = await firestore.collection("scheduledNotifications")
    .where("status", "==", "Processing")
    .limit(200)
    .get();

  for (const doc of snapshot.docs) {
    const startedAt = doc.data().startedAt?.toDate?.()?.getTime?.() || 0;
    if (startedAt && startedAt < cutoff) {
      const error = "A previous scheduled run stopped before it recorded a final result. It was not retried automatically to avoid a duplicate send.";
      await doc.ref.update({
        status: "Failed",
        lastError: error,
        executedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      await firestore.collection("notifications").doc(`scheduled_${doc.id}`).set({
        status: "Failed",
        errorSummary: error,
        deliveryConfirmed: false,
        sentAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }
  }
};

export const processDueScheduledNotifications = async ({ firestore, FieldPath, FieldValue, messaging }) => {
  const now = new Date();
  await markStaleProcessingSchedules(firestore, FieldValue);

  let cursor = null;
  let processed = 0;
  while (true) {
    let query = firestore.collection("scheduledNotifications")
      .where("status", "==", "Scheduled")
      .orderBy(FieldPath.documentId())
      .limit(500);
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.get();
    if (snapshot.empty) break;

    for (const scheduleDoc of snapshot.docs) {
      cursor = scheduleDoc;
      const data = scheduleDoc.data();
      if (scheduleDate(data.scheduledAt).getTime() > now.getTime()) continue;

      const historyRef = firestore.collection("notifications").doc(`scheduled_${scheduleDoc.id}`);
      const claimedData = await claimDueSchedule({
        firestore,
        FieldValue,
        scheduleRef: scheduleDoc.ref,
        historyRef,
        now,
      });
      if (!claimedData) continue;

      try {
        const result = await sendNotificationRecord({
          firestore,
          FieldPath,
          messaging,
          notificationRef: historyRef,
          notificationId: historyRef.id,
          title: claimedData.title,
          body: claimedData.body,
          type: claimedData.type,
          url: claimedData.destinationUrl || "/",
          audience: claimedData.targetAudience || "all",
        });
        await scheduleDoc.ref.update({
          status: result.status,
          totalTargetedDevices: result.totalTargetedDevices,
          fcmAcceptedCount: result.fcmAcceptedCount,
          failedCount: result.failedCount,
          invalidTokenCount: result.invalidTokenCount,
          executedAt: new Date(),
          updatedAt: new Date(),
          lateByMilliseconds: Math.max(0, now.getTime() - scheduleDate(claimedData.scheduledAt).getTime()),
          lastError: result.errorSummary || null,
        });
      } catch (error) {
        const message = "Scheduled notification processing failed. Automatic retry was stopped to avoid duplicate sends.";
        await scheduleDoc.ref.update({
          status: "Failed",
          executedAt: new Date(),
          updatedAt: new Date(),
          lastError: message,
          lastErrorCode: typeof error?.code === "string" ? error.code : "unknown",
        });
        await historyRef.set({
          status: "Failed",
          errorSummary: message,
          deliveryConfirmed: false,
          sentAt: new Date(),
        }, { merge: true });
      }
      processed += 1;
    }

    if (snapshot.size < 500) break;
  }

  return { processed };
};
