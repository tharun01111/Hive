export default function ChatComposer({ content, onChange, onSend }) {
  return (
    <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
      <form onSubmit={onSend} className="flex items-end gap-2">
        <textarea
          value={content}
          onChange={onChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend(e);
            }
          }}
          placeholder="Message..."
          rows={1}
          className="input text-sm resize-none flex-1"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="btn-primary px-3 py-2 shrink-0 active:scale-95 transition-transform"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M12 2L2 7l4 2 1 4 5-11z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);
