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
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-notion border border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
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
