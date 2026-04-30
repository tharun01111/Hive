import { motion as Motion } from "framer-motion";
import { useActivityFeed } from "../../hooks/useActivityFeed.js";
import EmptyState from "../ui/EmptyState.jsx";

const ACTIVITY_LABELS = {
  CARD_CREATED: "created card",
  CARD_UPDATED: "updated card",
  CARD_DELETED: "deleted card",
  CARD_MOVED: "moved card",
  CARD_ASSIGNED: "assigned card",
  COLUMN_CREATED: "created column",
  COLUMN_UPDATED: "updated column",
  COLUMN_DELETED: "deleted column",
};

const ACTIVITY_ICON_LABELS = {
  CARD_CREATED: "+",
  CARD_UPDATED: "edit",
  CARD_DELETED: "del",
  CARD_MOVED: "move",
  CARD_ASSIGNED: "@",
  COLUMN_CREATED: "+",
  COLUMN_UPDATED: "edit",
  COLUMN_DELETED: "del",
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function ActivityFeed() {
  const { activities, nextCursor, loading, loadingMore, loadMore } =
    useActivityFeed();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100 rounded-full animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        compact
        icon={<ActivityEmptyIcon />}
        title="No activity yet"
        description="When your team creates, moves, or completes work, it will appear here."
      />
    );
  }

  return (
    <div className="space-y-0.5">
      {activities.map((activity) => (
        <Motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
        >
          <ActivityItem activity={activity} />
        </Motion.div>
      ))}

      {nextCursor && (
        <div className="pt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity }) {
  const label = ACTIVITY_LABELS[activity.type] ?? activity.type.toLowerCase();
  const icon = ACTIVITY_ICON_LABELS[activity.type] ?? "log";
  const entityName = activity.meta?.title ?? activity.meta?.name ?? "";

  return (
    <div className="flex items-start gap-3 px-1 py-2.5 rounded-notion hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
      <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
          {activity.user?.name?.[0]?.toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-snug">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {activity.user?.name}
          </span>{" "}
          <span>{label}</span>
          {entityName && (
            <>
              {" "}
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                "{entityName}"
              </span>
            </>
          )}
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5">
          {timeAgo(activity.createdAt)}
        </p>
      </div>

      <span className="text-[10px] uppercase tracking-wide text-neutral-300 dark:text-neutral-700 shrink-0 mt-1 font-mono">
        {icon}
      </span>
    </div>
  );
}

const ActivityEmptyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M2.5 10h3l2.5-5 4 10 2.5-5h3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
