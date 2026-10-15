import React from "react";

/**
 * BrutalButton - Tactile Neo-Brutalist button with hard shadows and click offset.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button label / elements
 * @param {'primary' | 'secondary' | 'terminal' | 'cyan' | 'danger' | 'outline'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {React.ReactNode} [props.icon] - Optional Lucide or other icon
 * @param {'left' | 'right'} [props.iconPosition='left']
 * @param {boolean} [props.loading=false]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.href] - If supplied, renders as an <a> tag
 * @param {string} [props.className]
 */
export default function BrutalButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  href,
  className = "",
  onClick,
  type = "button",
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center font-mono font-medium tracking-tight
    border select-none whitespace-nowrap brutal-press
    transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950
  `;

  const sizeStyles = {
    sm: "text-xs px-2.5 py-1 gap-1.5 shadow-brutal-sm",
    md: "text-sm px-4 py-2 gap-2 shadow-brutal",
    lg: "text-base px-6 py-3 gap-2.5 shadow-brutal",
  };

  const variantStyles = {
    primary:
      "bg-[#0f1a14] text-white border-[#0f1a14] hover:bg-[#1b2e23] active:bg-[#23342a] dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100 dark:hover:bg-white dark:active:bg-zinc-200",
    secondary:
      "bg-[#e9f0ea] text-[#0f1a14] border-[#1b2e23] hover:border-[#0f1a14] hover:bg-[#d8e5da] dark:bg-[#18181b] dark:text-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800",
    terminal:
      "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 dark:bg-terminal-green dark:text-zinc-950 dark:border-emerald-400 dark:hover:bg-emerald-400 font-semibold",
    cyan:
      "bg-cyan-600 text-white border-cyan-700 hover:bg-cyan-700 dark:bg-terminal-cyan dark:text-zinc-950 dark:border-cyan-400 dark:hover:bg-cyan-400 font-semibold",
    danger:
      "bg-rose-600 text-white border-rose-500 hover:bg-rose-500",
    outline:
      "bg-transparent text-[#0f1a14] border-[#1b2e23] hover:bg-[#e9f0ea] dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:border-zinc-500",
  };

  const disabledStyles = disabled || loading
    ? "opacity-50 cursor-not-allowed pointer-events-none shadow-none translate-x-0 translate-y-0"
    : "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer";

  const combinedClasses = `
    ${baseStyles}
    ${sizeStyles[size] || sizeStyles.md}
    ${variantStyles[variant] || variantStyles.primary}
    ${disabledStyles}
    ${className}
  `.replace(/\s+/g, " ").trim();

  const content = (
    <>
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      )}
      {!loading && icon && iconPosition === "left" && (
        <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === "right" && (
        <span className="shrink-0">{icon}</span>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={combinedClasses}
      {...props}
    >
      {content}
    </button>
  );
}
