import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiExternalLink, FiRefreshCw, FiX } from "react-icons/fi";
import { loadPublicNotifications } from "../services/notificationApi";
import {
  formatNotificationTime,
  getSafeNotificationPath,
  markNotificationsRead,
  readLastReadAt,
} from "../utils/notificationDisplay";

const NotificationCenter = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastReadAt, setLastReadAt] = useState(readLastReadAt);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    window.matchMedia?.("(max-width: 1023px)").matches ?? false
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const updateViewport = () => setIsMobileViewport(media.matches);
    updateViewport();
    media.addEventListener?.("change", updateViewport);
    return () => media.removeEventListener?.("change", updateViewport);
  }, []);

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
    refreshNotifications();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshNotifications();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refreshNotifications]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((notification) => {
    const createdAt = new Date(notification.createdAt || 0).getTime();
    return createdAt > lastReadAt;
  }).length;

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      setLastReadAt(markNotificationsRead());
      refreshNotifications();
    }
  };

  const handleBellClick = () => {
    if (isMobileViewport) {
      setLastReadAt(markNotificationsRead());
      setIsOpen(false);
      navigate("/notifications");
      return;
    }
    handleToggle();
  };

  const openNotification = (notification) => {
    setIsOpen(false);
    navigate(getSafeNotificationPath(notification.url));
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleBellClick}
        className="relative p-1.5 xl:p-2 rounded-full text-gray-700 hover:bg-orange-50 hover:text-saffron transition-colors shrink-0"
        title="Village notifications"
        aria-label={unreadCount ? `Village notifications, ${unreadCount} unread` : "Village notifications"}
        aria-haspopup={isMobileViewport ? undefined : "dialog"}
        aria-expanded={!isMobileViewport && isOpen}
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[9px] leading-4 text-center font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          role="dialog"
          aria-label="Village notifications"
          className="absolute right-0 top-full mt-3 w-[min(92vw,26rem)] max-h-[72vh] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[80] overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 bg-white">
            <div>
              <h2 className="font-bold text-gray-900">गाँव की सूचनाएँ</h2>
              <p className="text-[11px] text-gray-500">सरेरी पोर्टल के हालिया नोटिफिकेशन</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={refreshNotifications}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                aria-label="Refresh notifications"
                title="Refresh"
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                aria-label="Close notifications"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[calc(72vh-4.5rem)] overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">सूचनाएँ लोड हो रही हैं…</p>
            ) : error && notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-600">{error}</p>
                <button type="button" onClick={refreshNotifications} className="mt-3 text-sm font-semibold text-indigo-700">फिर से कोशिश करें</button>
              </div>
            ) : notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">अभी कोई सूचना उपलब्ध नहीं है।</p>
            ) : (
              notifications.map((notification) => {
                const isUnread = new Date(notification.createdAt || 0).getTime() > lastReadAt;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openNotification(notification)}
                    className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-orange-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${isUnread ? "bg-orange-500" : "bg-transparent"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="font-bold text-sm text-gray-900 break-words">{notification.title}</span>
                          <FiExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        </span>
                        {notification.body && <span className="block text-xs text-gray-600 mt-1 line-clamp-3">{notification.body}</span>}
                        <span className="flex items-center justify-between gap-2 mt-2 text-[10px] text-gray-500">
                          <span>{notification.type}</span>
                          <span>{formatNotificationTime(notification.createdAt)} IST</span>
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default NotificationCenter;
