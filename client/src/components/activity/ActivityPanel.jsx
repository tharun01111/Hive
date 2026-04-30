import { motion as Motion } from "framer-motion";
import ActivityFeed from "./ActivityFeed.jsx";

export default function ActivityPanel({ onClose }) {
  return (
    <Motion.aside
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.18 }}
      className="w-80 shrink-0 border-l border-neutral-200 dark:border-neutral-800 flex flex-col h-full bg-white dark:bg-neutral-950"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Activity
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <ActivityFeed />
      </div>
    </Motion.aside>
  );
}

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2 2l10 10M12 2L2 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
