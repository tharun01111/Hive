import { useEffect } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <div
            className="absolute inset-0 bg-neutral-950/60"
            onClick={onClose}
          />
          <Motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.18 }}
            className={`relative w-full ${sizes[size]} overflow-hidden rounded-premium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-premium-lg`}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-5 py-4">
              <h2 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="btn-ghost p-1 text-neutral-400"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M3 3l9 9M12 3l-9 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
