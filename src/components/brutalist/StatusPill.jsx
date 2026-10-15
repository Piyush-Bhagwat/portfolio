import React from "react";

/**
 * StatusPill - Neo-Brutalist status indicator with an animated pulsing beacon dot.
 *
 * @param {Object} props
 * @param {string} [props.status="Available for work"] - Status text label
 * @param {'available' | 'busy' | 'building' | 'offline'} [props.variant="available"]
 * @param {'sm' | 'md'} [props.size="md"]
 * @param {string} [props.className]
 */
export default function StatusPill({
  status = "Available for work",
  variant = "available",
  size = "md",
  className = "",
  ...props
}) {
  const configs = {
    available: {
      wrapper: "bg-emerald-50 border-emerald-600/40 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-500/40 dark:text-emerald-400",
      ping: "bg-emerald-500 dark:bg-emerald-400",
      dot: "bg-emerald-600 dark:bg-emerald-500",
    },
    busy: {
      wrapper: "bg-amber-50 border-amber-600/40 text-amber-800 dark:bg-amber-950/30 dark:border-amber-500/40 dark:text-amber-400",
      ping: "bg-amber-500 dark:bg-amber-400",
      dot: "bg-amber-600 dark:bg-amber-500",
    },
    building: {
      wrapper: "bg-cyan-50 border-cyan-600/40 text-cyan-800 dark:bg-cyan-950/30 dark:border-cyan-500/40 dark:text-cyan-400",
      ping: "bg-cyan-500 dark:bg-cyan-400",
      dot: "bg-cyan-600 dark:bg-cyan-500",
    },
    offline: {
      wrapper: "bg-[#e9f0ea] border-[#cbdad0] text-[#4b5e53] dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400",
      ping: "hidden",
      dot: "bg-[#4b5e53] dark:bg-zinc-500",
    },
  };

  const current = configs[variant] || configs.available;

  const sizeStyles = {
    sm: "text-[11px] px-2.5 py-1 gap-2",
    md: "text-xs px-3 py-1.5 gap-2.5",
  };

  return (
    <div
      role="status"
      aria-label={status}
      className={`
        inline-flex items-center font-mono font-medium tracking-tight border
        select-none whitespace-nowrap shadow-brutal-sm rounded-none
        ${sizeStyles[size] || sizeStyles.md}
        ${current.wrapper}
        ${className}
      `.trim()}
      {...props}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.ping}`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`}
        />
      </span>
      <span className="truncate">{status}</span>
    </div>
  );
}
