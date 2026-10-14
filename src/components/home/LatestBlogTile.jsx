import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Clock, Calendar, Sparkles } from "lucide-react";
import { formatCardDate } from "../blog/BlogCard.jsx";
import { SAMPLE_INITIAL_POST } from "../../pages/admin/BlogsCMS.jsx";

/**
 * LatestBlogTile - Bento Tile 5 (Latest Article Feature - 1x1)
 * Highlights the most recent published technical article with direct reader link.
 */
export default function LatestBlogTile({ post = SAMPLE_INITIAL_POST, className = "" }) {
  const currentPost = post || SAMPLE_INITIAL_POST;
  const rawDate = currentPost.published_at || currentPost.updated_at || currentPost.created_at;
  const formattedDate = formatCardDate(rawDate);
  const readTime = currentPost.read_time_minutes || 3;
  const slug = currentPost.slug || currentPost.id || "building-resilient-web-interfaces";

  return (
    <div
      className={`
        border-2 border-zinc-800 bg-zinc-950 p-4 sm:p-5 shadow-brutal-sm
        flex flex-col justify-between font-mono hover:border-terminal-green
        hover:-translate-y-0.5 hover:shadow-brutal transition-all group ${className}
      `}
    >
      <div className="space-y-3">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 text-xs select-none">
          <div className="flex items-center gap-1.5 text-terminal-green">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-terminal-cyan">
              Latest Publication
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] bg-terminal-green text-black px-1.5 py-0.5 font-bold uppercase">
            <Sparkles className="w-2.5 h-2.5" />
            <span>New</span>
          </span>
        </div>

        {/* Article Title & Excerpt */}
        <div className="space-y-2">
          <Link
            to={`/blogs/${slug}`}
            className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-terminal-green transition-colors leading-snug block active:translate-x-0.5"
          >
            {currentPost.title}
          </Link>
          {currentPost.excerpt && (
            <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
              {currentPost.excerpt}
            </p>
          )}
        </div>

        {/* Telemetry (Date & Read Time) */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-600" />
            <span>{formattedDate}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-terminal-cyan">
            <Clock className="w-3 h-3" />
            <span>{`${readTime} min read`}</span>
          </span>
        </div>
      </div>

      {/* Reader CTA Link */}
      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
        <Link
          to={`/blogs/${slug}`}
          className="text-xs text-terminal-green font-bold hover:underline inline-flex items-center gap-1 group-hover:translate-x-1 active:translate-x-2 transition-transform"
        >
          <span>Read Full Article</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/blogs"
          className="text-[11px] text-zinc-500 hover:text-zinc-300"
        >
          All Articles &rarr;
        </Link>
      </div>
    </div>
  );
}

LatestBlogTile.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    slug: PropTypes.string,
    excerpt: PropTypes.string,
    read_time_minutes: PropTypes.number,
    published_at: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    updated_at: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    created_at: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  }),
  className: PropTypes.string,
};
