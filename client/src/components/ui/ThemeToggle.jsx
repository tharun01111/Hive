import { useState } from "react";
import { toggleTheme, getSystemTheme } from "../../utils/theme.js";

export default function ThemeToggle() {
  const stored = localStorage.getItem("hive-theme");
  const [theme, setTheme] = useState(stored || getSystemTheme());

  const handleToggle = () => {
    const next = toggleTheme(theme);
    setTheme(next);
  };

  return (
    <button
      onClick={handleToggle}
      className="btn-ghost p-1.5 text-neutral-400"
      title="Toggle theme"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.05 3.05l1.06 1.06M10.89 10.89l1.06 1.06M3.05 11.95l1.06-1.06M10.89 4.11l1.06-1.06"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M7.5 1.5a6 6 0 100 12 6 6 0 000-12z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M7.5 1.5A4.5 4.5 0 0112 6a4.5 4.5 0 01-4.5 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
