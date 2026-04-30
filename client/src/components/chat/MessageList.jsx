import EmptyState from "../ui/EmptyState.jsx";
import { MessageSkeleton } from "../ui/Skeleton.jsx";
import MessageBubble from "./MessageBubble.jsx";

const sameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

export default function MessageList({
  messages,
  user,
  loading,
  nextCursor,
  loadingMore,
  loadMore,
  messagesEndRef,
}) {
  if (loading) {
    return <MessageSkeleton />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {nextCursor && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 py-1"
        >
          {loadingMore ? "Loading..." : "Load older messages"}
        </button>
      )}

      {messages.length === 0 && (
        <EmptyState
          compact
          icon={<ChatEmptyIcon />}
          title="No messages yet"
          description="Start the project conversation."
        />
      )}

      {messages.map((msg, index) => {
        const showDate = index === 0 || !sameDay(messages[index - 1].createdAt, msg.createdAt);
        const isMe = msg.userId === user?.id;

        return (
          <div key={msg.id} className="space-y-3">
            {showDate && (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
                <span className="text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
                  {new Date(msg.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
              </div>
            )}
            <MessageBubble message={msg} isMe={isMe} />
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

const ChatEmptyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M4 4h12v8H9l-4 3v-3H4V4z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);
