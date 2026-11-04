import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiBell, FiRefreshCw } from "react-icons/fi";
import { loadPublicNotifications } from "../services/notificationApi";
import {
  formatNotificationTime,
  getSafeNotificationPath,
  markNotificationsRead,
} from "../utils/notificationDisplay";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    const result = await loadPublicNotifications();
    if (result.success) {
      setNotifications(result.notifications);
      setError("");
    } else {
      setError(result.error || "सूचनाएँ अभी लोड नहीं हो सकीं।");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    markNotificationsRead();
    refreshNotifications();
  }, [refreshNotifications]);

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/");
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 dark:bg-[#0B1120] dark:text-white">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={goBack}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="पिछले पेज पर जाएँ"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold">गाँव की सूचनाएँ</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">सरेरी पोर्टल के नोटिफिकेशन</p>
          </div>
          <button
            type="button"
            onClick={refreshNotifications}
            disabled={isLoading}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="सूचनाएँ फिर से लोड करें"
          >
            <FiRefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 pb-10">
        {isLoading && notifications.length === 0 ? (
          <div className="space-y-3 animate-pulse" role="status" aria-label="सूचनाएँ लोड हो रही हैं">
            <span className="sr-only">सूचनाएँ लोड हो रही हैं…</span>
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-28 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-4 h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                <div className="mt-2 h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : error && notifications.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-white p-6 text-center dark:border-amber-900 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">{error}</p>
            <button type="button" onClick={refreshNotifications} className="mt-4 rounded-xl bg-[#135334] px-4 py-2.5 text-sm font-bold text-white">
              फिर से कोशिश करें
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-900">
            <FiBell className="mx-auto h-9 w-9 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">अभी कोई सूचना उपलब्ध नहीं है।</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => navigate(getSafeNotificationPath(notification.url))}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50/40 active:bg-orange-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-orange-900 dark:hover:bg-slate-800"
              >
                <span className="flex items-start gap-3">
                  <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300">
                    <FiBell className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words font-bold">{notification.title}</span>
                    {notification.body && <span className="mt-1 block text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notification.body}</span>}
                    <span className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{notification.type}</span>
                      <span>{formatNotificationTime(notification.createdAt)} IST</span>
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
