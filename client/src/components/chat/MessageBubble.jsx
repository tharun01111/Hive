import { motion as Motion } from "framer-motion";
import { Avatar } from "../ui/Avatar.jsx";

export default function MessageBubble({ message, isMe }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16 }}
      className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}
    >
      {!isMe && <Avatar user={message.user} size="sm" />}
      <div className={`flex max-w-[85%] flex-col ${isMe ? "items-end" : "items-start"}`}>
        {!isMe && (
          <span className="mb-1 px-1 text-xs text-neutral-400 dark:text-neutral-600">
            {message.user?.name}
          </span>
        )}
        <div
          className={`rounded-notion px-3 py-2 text-sm leading-5 ${
            isMe
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
          }`}
        >
          {message.content}
        </div>
        <span className="mt-0.5 px-1 text-xs text-neutral-300 dark:text-neutral-700">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </Motion.div>
  );
}
