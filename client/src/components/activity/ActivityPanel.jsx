import { motion as Motion } from "framer-motion";
import ActivityFeed from "./ActivityFeed.jsx";

export default function ActivityPanel({ onClose }) {
  return (
    <Motion.aside
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.18 }}
      className="flex h-full w-80 shrink-0 flex-col border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
          Activity
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="btn-ghost p-1 text-neutral-400"
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
