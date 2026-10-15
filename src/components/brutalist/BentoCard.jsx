import React from "react";

/**
 * BentoCard - Neo-Brutalist container for bento grid layouts.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional classes
 * @param {string} [props.title] - Optional card title
 * @param {string} [props.subtitle] - Optional subtitle/description
 * @param {React.ReactNode} [props.badge] - Optional badge/pill in the card header
 * @param {React.ReactNode} [props.action] - Optional action icon/button in the header
 * @param {boolean} [props.dotPattern=false] - Apply subtle brutalist dot grid overlay
 * @param {boolean} [props.hover=true] - Enable tactile hover elevation & shadow
 * @param {string} [props.variant="default"] - 'default' | 'terminal' | 'bordered'
 * @param {Function} [props.onClick] - Click handler if card is interactive
 */
export default function BentoCard({
  children,
  className = "",
  title,
  subtitle,
  badge,
  action,
  dotPattern = false,
  hover = true,
  variant = "default",
  onClick,
  ...props
}) {
  const isClickable = Boolean(onClick);

  const variantStyles = {
    default: "bg-white dark:bg-[#121215] border-[#1b2e23] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-100",
    terminal: "bg-[#f4f7f4] dark:bg-[#09090b] border-[#1b2e23] dark:border-zinc-800 text-[#0f1a14] dark:text-zinc-100 font-mono",
    bordered: "bg-transparent border-[#1b2e23] dark:border-zinc-700 text-[#0f1a14] dark:text-zinc-100",
  };

  const hoverStyles = hover
    ? "transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal hover:border-[#0f1a14] dark:hover:border-zinc-700"
    : "";

  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      className={`
        relative rounded-none border shadow-brutal-sm p-5 md:p-6
        break-words [overflow-wrap:anywhere] overflow-hidden transition-colors
        ${variantStyles[variant] || variantStyles.default}
        ${hoverStyles}
        ${dotPattern ? "bg-grid-dots" : ""}
        ${isClickable ? "cursor-pointer select-none" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {(title || badge || action) && (
        <div className="flex items-start justify-between gap-3 mb-4 border-b border-[#cbdad0] dark:border-zinc-800/80 pb-3">
          <div className="min-w-0">
            {title && (
              <h3 className="font-mono text-base md:text-lg font-semibold tracking-tight text-[#0f1a14] dark:text-zinc-100 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#4b5e53] dark:text-zinc-400 mt-0.5 line-clamp-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {badge && <div>{badge}</div>}
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
