import React from "react";
import PropTypes from "prop-types";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme.js";

/**
 * ThemeToggle - Neo-Brutalist button for toggling between
 * Dark Terminal Mode and Subtle Greenish Sage Light Mode.
 */
export default function ThemeToggle({
  size = "md",
  showLabel = false,
  className = "",
}) {
  const { toggleTheme, isDark } = useTheme();

  const sizeStyles = {
    sm: "p-1.5 text-xs gap-1.5",
    md: "p-2 text-xs sm:text-sm gap-2",
    lg: "px-3 py-2 text-sm gap-2.5",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const currentIconClass = iconSizes[size] || iconSizes.md;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center font-mono font-bold
        border-2 border-[#1b2e23] dark:border-zinc-800
        bg-white dark:bg-zinc-900
        text-[#0f1a14] dark:text-zinc-100
        hover:border-emerald-600 dark:hover:border-terminal-green
        hover:text-emerald-700 dark:hover:text-terminal-green
        shadow-brutal-sm hover:-translate-x-[1px] hover:-translate-y-[1px]
        active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
        transition-all duration-150 select-none cursor-pointer focus:outline-none
        focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `.trim()}
      title={isDark ? "Switch to subtle sage light theme" : "Switch to terminal dark theme"}
      aria-label={isDark ? "Switch to subtle sage light theme" : "Switch to terminal dark theme"}
    >
      {isDark ? (
        <Sun className={`${currentIconClass} text-amber-400 animate-in spin-in-180 duration-200 shrink-0`} />
      ) : (
        <Moon className={`${currentIconClass} text-emerald-700 animate-in spin-in-180 duration-200 shrink-0`} />
      )}

      {showLabel && (
        <span className="truncate tracking-tight">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}

ThemeToggle.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  showLabel: PropTypes.bool,
  className: PropTypes.string,
};
