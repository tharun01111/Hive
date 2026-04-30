import { useState, useEffect, useRef } from "react";
import { useNotificationStore } from "../../store/notification.store.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import { markAllAsReadApi } from "../../api/notification.api.js";

export default function NotificationBell() {
  const { notifications, unreadCount } = useNotifications();
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const bellRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!bellRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = async () => {
    if (!open && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left - 260,
      });
    }

    setOpen(!open);

    if (!open && unreadCount > 0) {
      try {
        await markAllAsReadApi();
        markAllAsRead();
      } catch (err) {
        console.error("Failed to mark notifications as read", err);
      }
    }
  };

  return (
    <div ref={bellRef}>
      <button
        onClick={handleOpen}
        className="relative p-1.5 rounded-notion hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        title="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center">
            <span className="text-white dark:text-neutral-900 text-xs font-medium leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          className="fixed w-80 card shadow-notion-lg z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Notifications
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-neutral-400 dark:text-neutral-600">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-neutral-50 dark:border-neutral-800/50 last:border-0 ${
                    !n.read ? "bg-neutral-50 dark:bg-neutral-800/50" : ""
                  }`}
                >
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {n.message}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M7.5 1.5A3.5 3.5 0 004 5v3L2.5 9.5v1h10v-1L11 8V5a3.5 3.5 0 00-3.5-3.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 10.5a1.5 1.5 0 003 0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
