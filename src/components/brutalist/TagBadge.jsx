import React from "react";

/**
 * TagBadge - Monospace brutalist tech pill / badge with crisp borders.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Tag text or content
 * @param {'default' | 'terminal' | 'cyan' | 'amber' | 'purple' | 'white'} [props.variant='default']
 * @param {'sm' | 'md'} [props.size='md']
 * @param {boolean} [props.dot=false] - Show small colored status dot
 * @param {React.ReactNode} [props.icon] - Optional icon
 * @param {Function} [props.onClick] - Click handler if clickable
 * @param {Function} [props.onRemove] - Remove handler for tags input in CMS
 * @param {string} [props.className]
 */
export default function TagBadge({
  children,
  label,
  variant = "default",
  size = "md",
  dot = false,
  icon,
  onClick,
  onRemove,
  className = "",
  ...props
}) {
  const content = children ?? label;
  const isClickable = Boolean(onClick);

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const variantStyles = {
    default: "bg-[#e9f0ea] border-[#cbdad0] text-[#1b2e23] hover:border-[#1b2e23] dark:bg-[#18181b] dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500",
    terminal: "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-500/60 dark:text-emerald-400",
    cyan: "bg-cyan-50 border-cyan-300 text-cyan-800 dark:bg-cyan-950/40 dark:border-cyan-500/60 dark:text-cyan-400",
    amber: "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-500/60 dark:text-amber-400",
    purple: "bg-purple-50 border-purple-300 text-purple-800 dark:bg-purple-950/40 dark:border-purple-500/60 dark:text-purple-400",
    white: "bg-white border-[#1b2e23] text-[#0f1a14] dark:bg-zinc-900 dark:border-zinc-200 dark:text-zinc-100",
  };

  const dotColors = {
    default: "bg-zinc-500 dark:bg-zinc-400",
    terminal: "bg-emerald-600 dark:bg-emerald-400",
    cyan: "bg-cyan-600 dark:bg-cyan-400",
    amber: "bg-amber-600 dark:bg-amber-400",
    purple: "bg-purple-600 dark:bg-purple-400",
    white: "bg-[#0f1a14] dark:bg-zinc-100",
  };

  return (
    <span
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`
        inline-flex items-center font-mono font-medium tracking-tight rounded-none border
        select-none whitespace-nowrap transition-colors duration-150
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.default}
        ${isClickable ? "cursor-pointer hover:bg-[#d8e5da] dark:hover:bg-zinc-800" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotColors[variant] || dotColors.default
          }`}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{content}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          className="ml-0.5 hover:text-white transition-colors focus:outline-none"
          aria-label="Remove tag"
        >
          &times;
        </button>
      )}
    </span>
  );
}
