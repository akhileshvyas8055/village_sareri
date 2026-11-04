const SITE_ORIGIN = "https://www.villagesareri.in";
const TOKEN_PAGE_SIZE = 500;
const MAX_RETRIES = 2;
const RETRYABLE_CODES = new Set([
  "messaging/server-unavailable",
  "messaging/internal-error",
  "messaging/unknown-error",
  "messaging/message-rate-exceeded",
  "messaging/quota-exceeded",
  "app/network-error",
  "unavailable",
  "deadline-exceeded",
  "resource-exhausted",
]);
const INVALID_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getErrorCode = (error) => {
  const code = typeof error?.code === "string" ? error.code : "unknown";
  return code.startsWith("messaging/") || code.startsWith("app/") || code.includes("-") || RETRYABLE_CODES.has(code)
    ? code
    : `messaging/${code}`;
};

const isInvalidToken = (error) => INVALID_TOKEN_CODES.has(getErrorCode(error));
const isRetryable = (error) => RETRYABLE_CODES.has(getErrorCode(error));

export const notificationSiteOrigin = SITE_ORIGIN;

export const getSafeNotificationUrl = (value = "/") => {
  if (typeof value !== "string" || value.length > 2048) {
    throw new Error("The notification URL is invalid.");
  }

  let parsed;
  try {
    parsed = new URL(value || "/", SITE_ORIGIN);
  } catch {
    throw new Error("The notification URL is invalid.");
  }

  const allowedOrigins = new Set([SITE_ORIGIN, "https://villagesareri.in"]);
  if (parsed.protocol !== "https:" || !allowedOrigins.has(parsed.origin)) {
    throw new Error("The notification URL must point to the Village Sareri website.");
  }

  return parsed.href;
};

export const claimNotificationRecord = async (firestore, notificationId, record) => {
  const notificationRef = firestore.collection("notifications").doc(notificationId);
  const claim = await firestore.runTransaction(async (transaction) => {
    const existing = await transaction.get(notificationRef);
    if (existing.exists) return { claimed: false, existing: existing.data() };

    transaction.create(notificationRef, record);
    return { claimed: true };
  });

  return { notificationRef, ...claim };
};

export const enforceNotificationRateLimit = async (firestore, adminUid) => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const limit = 5;
  const rateRef = firestore.collection("notificationRateLimits").doc(adminUid);

  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(rateRef);
    const current = snapshot.data() || {};
    const windowStartedAt = Number(current.windowStartedAt || 0);
    const count = now - windowStartedAt < windowMs ? Number(current.count || 0) : 0;

    if (count >= limit) return false;

    transaction.set(rateRef, {
      windowStartedAt: count === 0 ? now : windowStartedAt,
      count: count + 1,
      updatedAt: new Date(now),
    });
    return true;
  });
};

const dateValue = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toIso = (value) => dateValue(value)?.toISOString() || null;

export const getNotificationDashboardData = async (firestore, FieldPath) => {
  const devicesByToken = new Map();
  let cursor = null;
  let tokenPage = firestore
    .collection("fcmTokens")
    .orderBy(FieldPath.documentId())
    .limit(TOKEN_PAGE_SIZE);

  while (true) {
    const pageQuery = cursor ? tokenPage.startAfter(cursor) : tokenPage;
    const snapshot = await pageQuery.get();
    if (snapshot.empty) break;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const token = typeof data.token === "string" ? data.token.trim() : "";
      if (!token) return;

      const active = data.status !== "invalid" && data.status !== "inactive" && data.enabled !== false;
      const current = devicesByToken.get(token);
      const candidate = {
        active,
        platform: ["android", "ios", "desktop"].includes(data.platform) ? data.platform : "unknown",
        lastSeen: dateValue(data.lastSeen),
        createdAt: dateValue(data.createdAt),
      };
      if (!current || (candidate.active && !current.active)) {
        devicesByToken.set(token, candidate);
      } else if (candidate.lastSeen && (!current.lastSeen || candidate.lastSeen > current.lastSeen)) {
        current.lastSeen = candidate.lastSeen;
      }
    });

    cursor = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < TOKEN_PAGE_SIZE) break;
  }

  const devices = [...devicesByToken.values()];
  const activeDevices = devices.filter((device) => device.active);
  const stats = {
    totalRegisteredDevices: devices.length,
    activeTokens: activeDevices.length,
    inactiveOrInvalidTokens: devices.length - activeDevices.length,
    androidDevices: activeDevices.filter((device) => device.platform === "android").length,
    iosDevices: activeDevices.filter((device) => device.platform === "ios").length,
    desktopDevices: activeDevices.filter((device) => device.platform === "desktop").length,
    unclassifiedDevices: activeDevices.filter((device) => device.platform === "unknown").length,
    lastSeen: toIso(activeDevices.map((device) => device.lastSeen).filter(Boolean).sort((a, b) => b - a)[0]),
    lastRegistration: toIso(activeDevices.map((device) => device.createdAt).filter(Boolean).sort((a, b) => b - a)[0]),
  };

  const notificationCollection = firestore.collection("notifications");
  const [byCreatedAt, byTimestamp] = await Promise.all([
    notificationCollection.orderBy("createdAt", "desc").limit(100).get(),
    notificationCollection.orderBy("timestamp", "desc").limit(100).get(),
  ]);
  const historyDocuments = new Map();
  [...byCreatedAt.docs, ...byTimestamp.docs].forEach((doc) => historyDocuments.set(doc.id, doc));
  const history = [...historyDocuments.values()]
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: typeof data.title === "string" ? data.title : "",
        body: typeof data.body === "string" ? data.body : "",
        targetAudience: data.targetAudience || data.audience || "all",
        createdAt: toIso(data.createdAt || data.timestamp),
        sentAt: toIso(data.sentAt),
        createdBy: data.createdByLabel || "Unknown administrator",
        totalTargetedDevices: Number(data.totalTargetedDevices || data.targetedDevices || 0),
        fcmAcceptedCount: Number(data.fcmAcceptedCount || data.fcmAccepted || 0),
        failedCount: Number(data.failedCount || data.failureCount || 0),
        invalidTokenCount: Number(data.invalidTokenCount || 0),
        status: data.status || "Unknown",
        deliveryConfirmed: data.deliveryConfirmed === true,
        errorSummary: data.errorSummary || null,
      };
    })
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
    .slice(0, 100);

  return { stats, history };
};

const getTargetTokens = async (firestore, FieldPath, audience) => {
  const byToken = new Map();
  let page = firestore
    .collection("fcmTokens")
    .orderBy(FieldPath.documentId())
    .limit(TOKEN_PAGE_SIZE);
  let cursor = null;

  while (true) {
    const pageQuery = cursor ? page.startAfter(cursor) : page;
    const snapshot = await pageQuery.get();
    if (snapshot.empty) break;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const token = typeof data.token === "string" ? data.token.trim() : "";
      if (!token || data.status === "invalid" || data.status === "inactive" || data.enabled === false) return;
      if (audience !== "all" && data.platform !== audience) return;

      const existing = byToken.get(token);
      if (existing) {
        existing.refs.push(doc.ref);
      } else {
        byToken.set(token, { token, refs: [doc.ref] });
      }
    });

    cursor = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < TOKEN_PAGE_SIZE) break;
  }

  return [...byToken.values()];
};

const markTokensInvalid = async (firestore, tokenEntries) => {
  const refs = tokenEntries.flatMap((entry) => entry.refs);
  for (let offset = 0; offset < refs.length; offset += TOKEN_PAGE_SIZE) {
    const batch = firestore.batch();
    refs.slice(offset, offset + TOKEN_PAGE_SIZE).forEach((ref) => {
      batch.update(ref, {
        status: "invalid",
        invalidatedAt: new Date(),
        updatedAt: new Date(),
      });
    });
    await batch.commit();
  }
};

const sendBatch = async (messaging, tokens, message) => {
  const accepted = [];
  const invalid = [];
  const failures = [];
  let pending = [...tokens];

  for (let attempt = 0; pending.length && attempt <= MAX_RETRIES; attempt += 1) {
    let batchResponse;
    try {
      batchResponse = await messaging.sendEachForMulticast({ ...message, tokens: pending.map((entry) => entry.token) });
    } catch (error) {
      const code = getErrorCode(error);
      if (isRetryable(error) && attempt < MAX_RETRIES) {
        const backoffMs = 250 * 2 ** attempt + Math.floor(Math.random() * 200);
        await delay(backoffMs);
        continue;
      }
      pending.forEach((entry) => failures.push({ entry, code }));
      break;
    }

    const retry = [];
    batchResponse.responses.forEach((response, index) => {
      const entry = pending[index];
      if (response.success) {
        accepted.push(entry);
      } else if (isInvalidToken(response.error)) {
        invalid.push(entry);
      } else if (isRetryable(response.error) && attempt < MAX_RETRIES) {
        retry.push(entry);
      } else {
        failures.push({ entry, code: getErrorCode(response.error) });
      }
    });

    pending = retry;
    if (pending.length) {
      const backoffMs = 250 * 2 ** attempt + Math.floor(Math.random() * 200);
      await delay(backoffMs);
    }
  }

  return { accepted, invalid, failures };
};

export const sendNotificationRecord = async ({
  firestore,
  FieldPath,
  messaging,
  notificationRef,
  notificationId,
  title,
  body,
  type,
  url,
  audience,
}) => {
  const targetedTokens = await getTargetTokens(firestore, FieldPath, audience);
  if (targetedTokens.length === 0) {
    const result = {
      status: "Failed",
      targetAudience: audience,
      totalTargetedDevices: 0,
      fcmAcceptedCount: 0,
      failedCount: 0,
      invalidTokenCount: 0,
      deliveryConfirmed: false,
      errorSummary: "No active subscribers matched this audience.",
      sentAt: new Date(),
    };
    await notificationRef.update(result);
    return result;
  }

  const emergency = /emergency|urgent/i.test(type);
  const ttlSeconds = emergency ? 300 : 86400;
  const iconUrl = `${SITE_ORIGIN}/photos/About.jpeg`;
  const message = {
    notification: {
      title,
      body,
      image: iconUrl,
    },
    data: {
      notificationId,
      title,
      body,
      type,
      url,
      link: url,
    },
    webpush: {
      headers: {
        TTL: String(ttlSeconds),
        Urgency: emergency ? "high" : "normal",
      },
      notification: {
        icon: iconUrl,
        badge: iconUrl,
        image: iconUrl,
        tag: notificationId,
        requireInteraction: emergency,
        data: { notificationId, url, link: url },
      },
      fcmOptions: { link: url },
    },
  };

  const acceptedTokens = [];
  const invalidTokens = [];
  const failures = [];
  for (let offset = 0; offset < targetedTokens.length; offset += TOKEN_PAGE_SIZE) {
    const batch = targetedTokens.slice(offset, offset + TOKEN_PAGE_SIZE);
    const result = await sendBatch(messaging, batch, message);
    acceptedTokens.push(...result.accepted);
    invalidTokens.push(...result.invalid);
    failures.push(...result.failures);
  }

  if (invalidTokens.length) await markTokensInvalid(firestore, invalidTokens);

  const failureCodes = failures.reduce((counts, failure) => {
    counts[failure.code] = (counts[failure.code] || 0) + 1;
    return counts;
  }, {});
  const acceptedCount = acceptedTokens.length;
  const failedCount = targetedTokens.length - acceptedCount;
  const status = acceptedCount === 0
    ? "Failed"
    : failedCount > 0
      ? "Partially Failed"
      : "FCM Accepted";
  const result = {
    status,
    targetAudience: audience,
    totalTargetedDevices: targetedTokens.length,
    fcmAcceptedCount: acceptedCount,
    failedCount,
    invalidTokenCount: invalidTokens.length,
    deliveryConfirmed: false,
    failureCodes,
    errorSummary: Object.keys(failureCodes).length ? failureCodes : null,
    sentAt: new Date(),
  };

  await notificationRef.update(result);
  return result;
};
