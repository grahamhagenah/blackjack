import { useCallback, useEffect, useState } from "react";

export const THEME_STORAGE_KEY = "retro-blackjack-theme";

// index.html sets data-theme before the page draws (saved choice, else the
// device's light/dark setting), so start from whatever it chose.
const initialTheme = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

const useTheme = () => {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    // Match the browser's toolbar color on phones to the page background
    const meta = document.querySelector('meta[name="theme-color"]');
    const background = getComputedStyle(root).getPropertyValue("--bg").trim();
    if (meta && background) meta.setAttribute("content", background);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // The choice just won't survive a reload
    }
    setTheme(next);
  }, [theme]);

  return [theme, toggleTheme];
};

export default useTheme;
