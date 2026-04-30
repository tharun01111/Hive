import { motion as Motion } from "framer-motion";

export default function TypingIndicator({ users }) {
  if (users.length === 0) return null;

  return (
    <div className="px-4 py-2">
      <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        <span>
          {users.map((u) => u.userName).join(", ")}{" "}
          {users.length === 1 ? "is" : "are"} typing
        </span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((dot) => (
            <Motion.span
              key={dot}
              className="h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-500"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.12 }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
