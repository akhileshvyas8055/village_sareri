import { auth } from "../firebase";

export const loadPublicNotifications = async () => {
  try {
    const response = await fetch("/api/public-notifications");
    const result = await response.json().catch(() => ({}));
    return {
      success: response.ok && result.success === true,
      notifications: Array.isArray(result.notifications) ? result.notifications : [],
      error: result.error,
    };
  } catch (error) {
    return { success: false, notifications: [], error: error?.message || "Notification inbox could not be loaded." };
  }
};

const makeRequestId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
};

export const sendNotificationRequest = async (payload) => {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, status: "Unauthorized", error: "Sign in with an admin account to send notifications." };
  }

  try {
    const idToken = await user.getIdToken();
    const response = await fetch("/api/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        ...payload,
        requestId: payload.requestId || makeRequestId(),
      }),
    });
    const result = await response.json().catch(() => ({}));

    return {
      ...result,
      httpStatus: response.status,
      success: response.ok && result.success === true,
    };
  } catch (error) {
    return {
      success: false,
      status: "Failed",
      error: error?.message || "The notification request could not reach the server.",
    };
  }
};

export const loadNotificationDashboard = async () => {
  const user = auth.currentUser;
  if (!user) return { success: false, error: "Sign in with an admin account to view notification data." };

  try {
    const idToken = await user.getIdToken();
    const response = await fetch("/api/notification-dashboard", {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const result = await response.json().catch(() => ({}));
    return {
      ...result,
      success: response.ok && result.success === true,
      httpStatus: response.status,
    };
  } catch (error) {
    return { success: false, error: error?.message || "The dashboard could not reach the server." };
  }
};

const getAuthorizedHeaders = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in with an admin account to manage notifications.");
  return { Authorization: `Bearer ${await user.getIdToken()}` };
};

export const loadScheduledNotifications = async () => {
  try {
    const response = await fetch("/api/scheduled-notifications", {
      headers: await getAuthorizedHeaders(),
    });
    const result = await response.json().catch(() => ({}));
    return { ...result, success: response.ok && result.success === true };
  } catch (error) {
    return { success: false, error: error?.message || "Scheduled notifications could not be loaded." };
  }
};

export const saveScheduledNotification = async (payload, id = null) => {
  try {
    const response = await fetch("/api/scheduled-notifications", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", ...(await getAuthorizedHeaders()) },
      body: JSON.stringify(id
        ? { ...payload, id, action: "edit" }
        : { ...payload, requestId: makeRequestId() }),
    });
    const result = await response.json().catch(() => ({}));
    return { ...result, success: response.ok && result.success === true };
  } catch (error) {
    return { success: false, error: error?.message || "Scheduled notification could not be saved." };
  }
};

export const cancelScheduledNotificationRequest = async (id) => {
  try {
    const response = await fetch("/api/scheduled-notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await getAuthorizedHeaders()) },
      body: JSON.stringify({ id, action: "cancel" }),
    });
    const result = await response.json().catch(() => ({}));
    return { ...result, success: response.ok && result.success === true };
  } catch (error) {
    return { success: false, error: error?.message || "Schedule could not be cancelled." };
  }
};

export const syncFirebaseAuthUsersPage = async (pageToken = null) => {
  try {
    const response = await fetch("/api/sync-auth-users", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await getAuthorizedHeaders()) },
      body: JSON.stringify(pageToken ? { pageToken } : {}),
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      const isLocalVite = ["localhost", "127.0.0.1"].includes(globalThis.location?.hostname);
      return {
        success: false,
        error: isLocalVite
          ? "Local Vite preview cannot run Firebase Auth sync APIs. Deploy this build to Vercel, or start it with an authenticated `vercel dev` session."
          : "The user sync API did not return JSON. Check that the Vercel API deployment completed successfully.",
        httpStatus: response.status,
      };
    }
    const result = await response.json().catch(() => ({}));
    return {
      ...result,
      success: response.ok && result.success === true,
      httpStatus: response.status,
    };
  } catch (error) {
    return { success: false, error: error?.message || "Firebase Auth users could not be synced." };
  }
};

export const formatKolkataDateTimeInput = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date).reduce((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

export const kolkataDateTimeInputToIso = (value) => {
  const match = typeof value === "string"
    ? value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/)
    : null;
  if (!match) return null;

  const [, year, month, day, hour, minute] = match.map(Number);
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const check = new Date(localAsUtc);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    check.getUTCHours() !== hour ||
    check.getUTCMinutes() !== minute
  ) return null;

  return new Date(localAsUtc - 330 * 60 * 1000).toISOString();
};
