import { useState } from "react";
import PropTypes from "prop-types";
import { Copy, Check } from "lucide-react";

/**
 * CodeBlock - Neo-Brutalist syntax block with copy-to-clipboard,
 * language indicator, and terminal styling.
 */
export default function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeText = String(children).replace(/\n$/, "");

  if (inline) {
    return (
      <code
        className="bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 text-emerald-800 dark:text-terminal-green px-1.5 py-0.5 rounded-none font-mono text-xs"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(codeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignore copy error
    }
  };

  return (
    <div className="my-5 border-2 border-[#1b2e23] dark:border-zinc-800 bg-[#f4f7f4] dark:bg-zinc-950 font-mono text-xs not-prose shadow-brutal-forest dark:shadow-brutal-sm overflow-hidden">
      {/* Codeblock Terminal Header */}
      <div className="bg-[#e9f0ea] dark:bg-zinc-900 px-3.5 py-2 border-b border-[#cbdad0] dark:border-zinc-800 flex items-center justify-between text-[#4b5e53] dark:text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-terminal-cyan" />
          <span className="text-[11px] text-emerald-700 dark:text-terminal-cyan uppercase font-bold tracking-wider">
            {language || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-[#4b5e53] dark:text-zinc-400 hover:text-[#0f1a14] dark:hover:text-zinc-100 p-1 hover:bg-[#cbdad0]/50 dark:hover:bg-zinc-800 border border-transparent hover:border-[#cbdad0] dark:hover:border-zinc-700 transition-colors"
          title="Copy code to clipboard"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-terminal-green" />
              <span className="text-emerald-700 dark:text-terminal-green font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code text content */}
      <pre className="p-4 overflow-x-auto text-[#0f1a14] dark:text-zinc-200 bg-[#f4f7f4] dark:bg-zinc-950 leading-relaxed font-mono">
        <code>{codeText}</code>
      </pre>
    </div>
  );
}

CodeBlock.propTypes = {
  inline: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};
