import { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * ReadingProgressBar - Sticky top progress meter tracking article scroll depth
 */
export default function ReadingProgressBar({ className = "" }) {
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
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`fixed top-0 left-0 right-0 z-50 h-1 sm:h-1.5 bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-sm ${className}`}
    >
      <div
        className="h-full bg-terminal-green transition-all duration-75 ease-out shadow-[0px_0px_10px_rgba(16,185,129,0.9)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

ReadingProgressBar.propTypes = {
  className: PropTypes.string,
};
