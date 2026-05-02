export default function ChatHeader({ projectName, onClose }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
      <div>
        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
          Project chat
        </p>
        {projectName && (
          <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
            {projectName}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="btn-ghost p-1 text-neutral-400"
      >
        <CloseIcon />
      </button>
    </div>
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
