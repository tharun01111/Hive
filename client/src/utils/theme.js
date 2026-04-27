export const getSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const initTheme = () => {
  const stored = localStorage.getItem("hive-theme");
  const theme = stored || getSystemTheme();
  applyTheme(theme);
  return theme;
};

export const toggleTheme = (current) => {
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem("hive-theme", next);
  applyTheme(next);
  return next;
};

export const watchSystemTheme = (callback) => {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e) => {
    const stored = localStorage.getItem("hive-theme");
    if (!stored) {
      const theme = e.matches ? "dark" : "light";
      applyTheme(theme);
      callback(theme);
    }
  };
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
};
