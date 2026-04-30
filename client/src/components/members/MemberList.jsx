import { useAuthStore } from "../../store/auth.store.js";

export default function MemberList({ members, onRemove, currentUserRole }) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                {member.user.name[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {member.user.name}
                {member.user.id === user?.id && (
                  <span className="ml-1.5 text-xs text-neutral-400 dark:text-neutral-600">
                    (you)
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {member.user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                member.role === "ADMIN"
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {member.role === "ADMIN" ? "Admin" : "Member"}
            </span>

            {currentUserRole === "ADMIN" && member.user.id !== user?.id && (
              <button
                onClick={() => onRemove(member.user.id)}
                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-400 hover:text-red-500 transition-colors"
                title="Remove member"
              >
                <RemoveIcon />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const RemoveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2 2l10 10M12 2L2 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
