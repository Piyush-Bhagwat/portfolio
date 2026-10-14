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
      "bg-zinc-100 text-zinc-950 border-zinc-100 hover:bg-white active:bg-zinc-200",
    secondary:
      "bg-[#18181b] text-zinc-100 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800",
    terminal:
      "bg-terminal-green text-zinc-950 border-emerald-400 hover:bg-emerald-400 font-semibold",
    cyan:
      "bg-terminal-cyan text-zinc-950 border-cyan-400 hover:bg-cyan-400 font-semibold",
    danger:
      "bg-rose-600 text-white border-rose-500 hover:bg-rose-500",
    outline:
      "bg-transparent text-zinc-200 border-zinc-700 hover:bg-zinc-900 hover:border-zinc-500",
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
