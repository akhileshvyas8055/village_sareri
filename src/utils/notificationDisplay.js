export const LAST_READ_KEY = "sareri_notifications_last_read";

export const readLastReadAt = () => {
  try {
    const saved = Number(localStorage.getItem(LAST_READ_KEY));
    if (saved > 0) return saved;
    const initial = Date.now();
    localStorage.setItem(LAST_READ_KEY, String(initial));
    return initial;
  } catch {
    return Date.now();
  }
};

export const markNotificationsRead = () => {
  const now = Date.now();
  try {
    localStorage.setItem(LAST_READ_KEY, String(now));
  } catch {
    // Notifications remain usable when browser storage is unavailable.
  }
  return now;
};

export const formatNotificationTime = (value) => {
  if (!value) return "समय उपलब्ध नहीं";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "समय उपलब्ध नहीं";
  return new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const getSafeNotificationPath = (value) => {
  try {
    const url = new URL(value || "/", window.location.origin);
    const allowedOrigins = new Set([
      window.location.origin,
      "https://www.villagesareri.in",
      "https://villagesareri.in",
    ]);
    if (!allowedOrigins.has(url.origin)) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
};
