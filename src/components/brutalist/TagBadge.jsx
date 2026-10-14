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
  variant = "default",
  size = "md",
  dot = false,
  icon,
  onClick,
  onRemove,
  className = "",
  ...props
}) {
  const isClickable = Boolean(onClick);

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const variantStyles = {
    default: "bg-[#18181b] border-zinc-700 text-zinc-300 hover:border-zinc-500",
    terminal: "bg-emerald-950/40 border-emerald-500/60 text-emerald-400",
    cyan: "bg-cyan-950/40 border-cyan-500/60 text-cyan-400",
    amber: "bg-amber-950/40 border-amber-500/60 text-amber-400",
    purple: "bg-purple-950/40 border-purple-500/60 text-purple-400",
    white: "bg-zinc-900 border-zinc-200 text-zinc-100",
  };

  const dotColors = {
    default: "bg-zinc-400",
    terminal: "bg-emerald-400",
    cyan: "bg-cyan-400",
    amber: "bg-amber-400",
    purple: "bg-purple-400",
    white: "bg-zinc-100",
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
        ${isClickable ? "cursor-pointer hover:bg-zinc-800" : ""}
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
      <span className="truncate">{children}</span>
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
