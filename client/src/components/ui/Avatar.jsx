export function Avatar({ user, size = "md", title }) {
  const sizes = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-7 w-7 text-xs",
    lg: "h-8 w-8 text-sm",
  };

  const name = user?.name ?? user?.user?.name ?? "User";
  const avatarUrl = user?.avatarUrl ?? user?.user?.avatarUrl;

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white bg-neutral-200 font-medium text-neutral-600 dark:border-neutral-900 dark:bg-neutral-700 dark:text-neutral-300`}
      title={title ?? name}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  );
}

export function AvatarStack({ members = [], limit = 4, size = "md" }) {
  const visible = members.slice(0, limit);
  const remaining = Math.max(members.length - limit, 0);

  return (
    <div className="flex -space-x-2">
      {visible.map((member) => (
        <Avatar key={member.id ?? member.user?.id} user={member.user ?? member} size={size} />
      ))}
      {remaining > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white bg-neutral-100 text-[10px] font-medium text-neutral-500 dark:border-neutral-900 dark:bg-neutral-800 dark:text-neutral-400">
          +{remaining}
        </div>
      )}
    </div>
  );
}
