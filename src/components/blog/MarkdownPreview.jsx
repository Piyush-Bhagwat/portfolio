import { forwardRef, useState } from "react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, FileText } from "lucide-react";

/**
 * Custom CodeBlock renderer with syntax highlight styling, copy button,
 * and terminal window styling.
 */
function CodeBlock({ inline, className, children, ...props }) {
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

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 border-2 border-[#1b2e23] dark:border-zinc-800 bg-[#f4f7f4] dark:bg-zinc-950 font-mono text-xs not-prose shadow-brutal-forest dark:shadow-brutal-sm overflow-hidden">
      <div className="bg-[#e9f0ea] dark:bg-zinc-900 px-3 py-1.5 border-b border-[#cbdad0] dark:border-zinc-800 flex items-center justify-between text-[#4b5e53] dark:text-zinc-400">
        <span className="text-[11px] text-emerald-700 dark:text-terminal-cyan uppercase font-bold tracking-wider">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-[#0f1a14] dark:hover:text-zinc-100 p-0.5"
          title="Copy code"
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

/**
 * MarkdownPreview - Real-time rendered preview pane supporting GitHub Flavored
 * Markdown (tables, task lists, code blocks, autolinks).
 */
const MarkdownPreview = forwardRef(function MarkdownPreview(
  { content = "", className = "" },
  ref
) {
  if (!content.trim()) {
    return (
      <div
        ref={ref}
        className={`p-8 text-center text-[#6e8276] dark:text-zinc-500 font-mono text-xs flex flex-col items-center justify-center space-y-3 h-full min-h-[300px] ${className}`}
      >
        <FileText className="w-8 h-8 text-[#cbdad0] dark:text-zinc-700" />
        <p className="max-w-xs leading-relaxed">
          Real-time preview will render here as you type Markdown in the editor.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`prose dark:prose-invert prose-emerald max-w-none font-mono text-xs sm:text-sm p-6 overflow-y-auto leading-relaxed ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold font-mono text-[#0f1a14] dark:text-zinc-100 border-b-2 border-[#1b2e23] dark:border-zinc-800 pb-2 mb-4 mt-6 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold font-mono text-[#0f1a14] dark:text-zinc-100 border-b border-[#cbdad0] dark:border-zinc-800 pb-1.5 mb-3 mt-5 tracking-tight flex items-center gap-2">
              <span className="text-emerald-600 dark:text-terminal-green">#</span>
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold font-mono text-[#0f1a14] dark:text-zinc-200 mb-2 mt-4">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-[#2c3e34] dark:text-zinc-300 leading-relaxed font-mono">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-600 dark:border-terminal-green bg-[#e9f0ea] dark:bg-zinc-900/40 pl-4 py-2 my-4 text-[#2c3e34] dark:text-zinc-300 italic not-italic">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 dark:text-terminal-cyan underline hover:text-emerald-900 dark:hover:text-cyan-300 transition-colors"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal-sm">
              <table className="w-full border-collapse font-mono text-xs text-left">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#e9f0ea] dark:bg-zinc-900 border-b-2 border-[#1b2e23] dark:border-zinc-800 text-emerald-800 dark:text-terminal-green font-bold uppercase">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="p-2.5 border-r border-[#cbdad0] dark:border-zinc-800 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-2.5 border-t border-r border-[#cbdad0] dark:border-zinc-800 last:border-r-0 text-[#2c3e34] dark:text-zinc-300">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || "Article illustration"}
              className="border-2 border-[#1b2e23] dark:border-zinc-800 my-4 max-w-full h-auto shadow-brutal-forest dark:shadow-brutal"
            />
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-3 text-[#2c3e34] dark:text-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-3 text-[#2c3e34] dark:text-zinc-300">
              {children}
            </ol>
          ),
          hr: () => <hr className="border-t-2 border-[#cbdad0] dark:border-zinc-800 my-6" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownPreview.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string,
};

export default MarkdownPreview;
