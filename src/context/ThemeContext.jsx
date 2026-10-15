import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export const THEME_STORAGE_KEY = "portfolio-theme";

export const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: true,
});

/**
 * Resolves the initial theme preference:
 * 1. Explicitly stored localStorage value ('dark' | 'light')
 * 2. System OS preference (prefers-color-scheme: dark)
 * 3. Fallback: 'dark'
 */
function getInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      return stored;
    }

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  } catch {
    // Fallback if localStorage or matchMedia is restricted
  }

  return "dark";
}

/**
 * ThemeProvider - Global State Provider for Dark / Light Modes
 * Synchronizes 'dark' class on <html> with localStorage and system media queries.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => getInitialTheme());

  // Synchronize <html> root class whenever theme changes
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [theme]);

  // Listen to OS system preference changes if no manual preference is locked in localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        // Only react to system changes if user hasn't explicitly set a preference
        if (!stored) {
          setThemeState(e.matches ? "dark" : "light");
        }
      } catch {
        // Fallback
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme !== "dark" && newTheme !== "light") return;
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignored in private/sandboxed modes
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => {
      const nextTheme = prevTheme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // Ignored
      }
      return nextTheme;
    });
  }, []);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme hook for consuming current theme & toggle controls
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeProvider;
