export default function EmptyState({
  icon = <DefaultIcon />,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "px-3 py-6" : "px-6 py-14"
      }`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-premium border border-[color-mix(in_srgb,var(--hive-accent)_24%,var(--hive-border))] bg-[var(--hive-accent-soft)] text-[var(--hive-accent-strong)] shadow-[0_0_24px_rgba(62,207,142,0.12)]">
        {icon}
      </div>
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h2>
      {description && (
        <p className="mt-1 max-w-sm text-sm leading-6 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

const DefaultIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M4 6.5h12M4 10h12M4 13.5h7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
