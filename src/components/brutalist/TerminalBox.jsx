import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * TerminalBox - Brutalist developer window box with macOS/Linux dots,
 * title bar, and monospace code/command body.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Terminal content / commands
 * @param {string} [props.title='terminal'] - Window header title
 * @param {string} [props.copyText] - Optional text to copy via header copy icon
 * @param {React.ReactNode} [props.actions] - Additional header action items
 * @param {boolean} [props.dotControls=true] - Display red/amber/green window dots
 * @param {string} [props.className]
 * @param {string} [props.bodyClassName]
 */
export default function TerminalBox({
  children,
  title = "terminal",
  copyText,
  actions,
  dotControls = true,
  className = "",
  bodyClassName = "",
  ...props
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className={`
        border border-[#1b2e23] dark:border-zinc-800 bg-[#f4f7f4] dark:bg-terminal-bg shadow-brutal rounded-none overflow-hidden transition-colors
        ${className}
      `.trim()}
      {...props}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#e9f0ea] dark:bg-[#121215] border-b border-[#cbdad0] dark:border-zinc-800 select-none">
        <div className="flex items-center gap-2">
          {dotControls && (
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/90 inline-block border border-red-600/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/90 inline-block border border-amber-600/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]/90 inline-block border border-emerald-600/40" />
            </div>
          )}
          <span className="font-mono text-xs text-[#0f1a14] dark:text-zinc-400 font-medium tracking-wide ml-1 truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {actions}
          {copyText && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs font-mono text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100 transition-colors p-1"
              title="Copy code"
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">copied</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Terminal Body */}
      <div
        className={`
          p-4 md:p-5 font-mono text-sm text-[#0f1a14] dark:text-zinc-200 overflow-x-auto
          break-words [overflow-wrap:anywhere] leading-relaxed
          ${bodyClassName}
        `.trim()}
      >
        {children}
      </div>
    </div>
  );
}
