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

export function WhatsAppIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

WhatsAppIcon.propTypes = {
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
  onShareWhatsApp,
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
        <BrutalButton
          variant="outline"
          size="sm"
          onClick={onShareWhatsApp}
          icon={<WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-terminal-green" />}
          className="w-full text-[11px]"
        >
          Share on WhatsApp
        </BrutalButton>

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
  onShareWhatsApp: PropTypes.func,
  onShareTwitter: PropTypes.func,
  onShareLinkedIn: PropTypes.func,
  className: PropTypes.string,
};
