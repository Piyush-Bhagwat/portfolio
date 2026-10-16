import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { BookOpen, Share2, Check } from "lucide-react";
import { TerminalBox, BrutalButton } from "../brutalist";

export function XIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

XIcon.propTypes = {
  className: PropTypes.string,
};

export function LinkedInIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 0 0 0-3.38 1.69 1.69 0 0 0 0 3.38m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

LinkedInIcon.propTypes = {
  className: PropTypes.string,
};

/**
 * ArticleActionsBar - Tier 2 Right Sidebar Reading Progress & Action Controls
 */
export default function ArticleActionsBar({
  readTime = 3,
  formattedDate = "Recently",
  ratingAverage = 0,
  ratingCount = 0,
  commentCount = 0,
  copiedLink = false,
  onCopyLink,
  onShareTwitter,
  onShareLinkedIn,
  className = "",
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }
      const pct = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      setProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <TerminalBox
      title="article.metadata"
      className={`border-2 border-[#1b2e23] dark:border-zinc-800 shadow-brutal-forest dark:shadow-brutal-sm p-4 space-y-3.5 text-xs font-mono ${className}`}
    >
      {/* Tier 2 Reading Progress Gauge */}
      <div className="space-y-1.5 border-b border-[#cbdad0] dark:border-zinc-900 pb-3">
        <div className="flex items-center justify-between text-[11px] text-[#4b5e53] dark:text-zinc-400">
          <span className="flex items-center gap-1 font-bold text-[#0f1a14] dark:text-zinc-300">
            <BookOpen className="w-3.5 h-3.5 text-teal-700 dark:text-terminal-cyan" />
            <span>Reading Progress:</span>
          </span>
          <span className="font-bold text-emerald-700 dark:text-terminal-green">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#e9f0ea] dark:bg-zinc-900 border border-[#cbdad0] dark:border-zinc-800 overflow-hidden">
          <div
            className="h-full bg-emerald-600 dark:bg-terminal-green transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Metadata Detail Rows */}
      <div className="space-y-2 text-[#4b5e53] dark:text-zinc-400 text-[11px]">
        <div className="flex items-center justify-between border-b border-[#cbdad0] dark:border-zinc-900 pb-1.5">
          <span>Reading Depth:</span>
          <span className="text-emerald-700 dark:text-terminal-green font-bold">{`${readTime} min`}</span>
        </div>
        <div className="flex items-center justify-between border-b border-[#cbdad0] dark:border-zinc-900 pb-1.5">
          <span>Average Rating:</span>
          <span className="text-amber-700 dark:text-amber-400 font-bold inline-flex items-center gap-1 font-mono">
            <span>{ratingCount > 0 ? `${ratingAverage.toFixed(1)} (${ratingCount})` : "New"}</span>
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-[#cbdad0] dark:border-zinc-900 pb-1.5">
          <span>Discussions:</span>
          <span className="text-emerald-700 dark:text-terminal-green font-bold font-mono">
            {`${commentCount} comment${commentCount === 1 ? "" : "s"}`}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-[#cbdad0] dark:border-zinc-900 pb-1.5">
          <span>Publication:</span>
          <span className="text-[#0f1a14] dark:text-zinc-300 font-bold">{formattedDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <span className="text-emerald-700 dark:text-terminal-green font-bold">● Published</span>
        </div>
      </div>

      {/* Social Actions */}
      <div className="pt-2 border-t border-[#cbdad0] dark:border-zinc-900 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <BrutalButton
            variant="outline"
            size="sm"
            onClick={onShareTwitter}
            icon={<XIcon className="w-3 h-3" />}
            className="w-full text-[11px]"
          >
            Share on X
          </BrutalButton>
          <BrutalButton
            variant="outline"
            size="sm"
            onClick={onShareLinkedIn}
            icon={<LinkedInIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
            className="w-full text-[11px]"
          >
            Share on LinkedIn
          </BrutalButton>
        </div>

        <BrutalButton
          variant="outline"
          size="sm"
          className="w-full text-[11px]"
          onClick={onCopyLink}
          icon={
            copiedLink ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-terminal-green" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )
          }
        >
          {copiedLink ? "Link Copied!" : "Copy Link"}
        </BrutalButton>
      </div>
    </TerminalBox>
  );
}

ArticleActionsBar.propTypes = {
  readTime: PropTypes.number,
  formattedDate: PropTypes.string,
  ratingAverage: PropTypes.number,
  ratingCount: PropTypes.number,
  commentCount: PropTypes.number,
  copiedLink: PropTypes.bool,
  onCopyLink: PropTypes.func,
  onShareTwitter: PropTypes.func,
  onShareLinkedIn: PropTypes.func,
  className: PropTypes.string,
};
