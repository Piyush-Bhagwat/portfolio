import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ListTree, ChevronRight } from "lucide-react";

/**
 * Normalizes text to a clean URL anchor slug
 * @param {string|React.ReactNode} text
 * @returns {string}
 */
export function toHeadingSlug(text) {
  const str =
    typeof text === "string"
      ? text
      : Array.isArray(text)
      ? text
          .map((c) => (typeof c === "string" ? c : c?.props?.children || ""))
          .join("")
      : String(text || "");

  return str
    .replace(/[*_`~[\]]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}

/**
 * Extracts and normalizes markdown headings for TOC navigation
 * @param {string} markdown
 * @returns {Array<{ level: number, title: string, slug: string }>}
 */
export function extractHeadings(markdown = "") {
  if (!markdown || typeof markdown !== "string") return [];

  // Match #, ##, ### lines while ignoring code block fences
  const lines = markdown.split("\n");
  const headings = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (match) {
      const level = match[1].length;
      const rawTitle = match[2].trim();
      // Clean markdown inline styles like **bold** or `code`
      const cleanTitle = rawTitle.replace(/[*_`~[\]]/g, "").trim();
      const slug = toHeadingSlug(cleanTitle);

      if (cleanTitle) {
        headings.push({ level, title: cleanTitle, slug });
      }
    }
  }

  return headings;
}

/**
 * TableOfContents - Sticky Neo-Brutalist reading navigation
 */
export default function TableOfContents({
  content = "",
  className = "",
}) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const [activeSlug, setActiveSlug] = useState("");

  // Track active heading via IntersectionObserver
  useEffect(() => {
    if (typeof window === "undefined" || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    headings.forEach(({ slug }) => {
      const el = document.getElementById(slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleScrollToHeading = (e, slug) => {
    e.preventDefault();
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSlug(slug);
      window.history.pushState(null, "", `#${slug}`);
    }
  };

  return (
    <nav
      aria-label="Table of Contents"
      className={`border-2 border-zinc-800 bg-zinc-950 p-4 font-mono text-xs shadow-brutal-sm ${className}`}
    >
      <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-zinc-800 text-zinc-300 font-bold select-none">
        <ListTree className="w-4 h-4 text-terminal-green" />
        <span className="text-[11px] uppercase tracking-wider text-terminal-cyan">
          Table of Contents
        </span>
      </div>

      <ul className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {headings.map(({ level, title, slug }) => {
          const isActive = activeSlug === slug;
          return (
            <li
              key={`${slug}-${title}`}
              style={{ paddingLeft: `${(level - 1) * 12}px` }}
            >
              <a
                href={`#${slug}`}
                onClick={(e) => handleScrollToHeading(e, slug)}
                className={`
                  flex items-center gap-1.5 py-1 text-[11px] transition-colors leading-relaxed block
                  ${
                    isActive
                      ? "text-terminal-green font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }
                `}
              >
                <ChevronRight
                  className={`w-3 h-3 shrink-0 transition-transform ${
                    isActive ? "text-terminal-green translate-x-0.5" : "text-zinc-600"
                  }`}
                />
                <span className="line-clamp-1">{title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

TableOfContents.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string,
};
