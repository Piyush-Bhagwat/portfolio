import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Clock, Calendar, Sparkles, Star, MessageSquare } from "lucide-react";
import { formatCardDate } from "../blog/BlogCard.jsx";
import { SAMPLE_INITIAL_POST } from "../../pages/admin/BlogsCMS.jsx";

/**
 * LatestBlogTile - Bento Tile 5 (Latest Article Feature - 1x1)
 * Highlights the most recent published article with direct reader link.
 */
export default function LatestBlogTile({ post = SAMPLE_INITIAL_POST, className = "" }) {
  const currentPost = post || SAMPLE_INITIAL_POST;
  const rawDate = currentPost.published_at || currentPost.updated_at || currentPost.created_at;
  const formattedDate = formatCardDate(rawDate);
  const readTime = currentPost.read_time_minutes || 3;
  const slug = currentPost.slug || currentPost.id || "building-resilient-web-interfaces";

  const ratingAverage = Number(currentPost.rating_average) || 0;
  const ratingCount = Number(currentPost.rating_count) || 0;
  const commentCount = Number(currentPost.comment_count) || 0;

  return (
    <div
      className={`
        border-2 border-[#1b2e23] dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 sm:p-5 shadow-brutal-forest dark:shadow-brutal-sm
        flex flex-col justify-between font-mono hover:border-emerald-700 dark:hover:border-terminal-green
        hover:-translate-y-0.5 hover:shadow-brutal transition-all group ${className}
      `}
    >
      <div className="space-y-3">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-[#cbdad0] dark:border-zinc-800/80 pb-2.5 text-xs select-none">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-terminal-green">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-terminal-cyan">
              Latest Publication
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-600 dark:bg-terminal-green text-white dark:text-black px-1.5 py-0.5 font-bold uppercase">
            <Sparkles className="w-2.5 h-2.5" />
            <span>New</span>
          </span>
        </div>

        {/* Article Title & Excerpt */}
        <div className="space-y-2">
          <Link
            to={`/blogs/${slug}`}
            className="text-base sm:text-lg font-bold text-[#0f1a14] dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-terminal-green transition-colors leading-snug block active:translate-x-0.5"
          >
            {currentPost.title}
          </Link>
          {currentPost.excerpt && (
            <p className="text-xs text-[#4b5e53] dark:text-zinc-400 font-sans line-clamp-2 leading-relaxed">
              {currentPost.excerpt}
            </p>
          )}
        </div>

        {/* Engagement Badges: Rating & Comments */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] font-mono">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e9f0ea] dark:bg-[#18181b] border border-[#cbdad0] dark:border-zinc-800 text-amber-700 dark:text-amber-400 font-bold"
            title={
              ratingCount > 0
                ? `Average Rating: ${ratingAverage.toFixed(1)} / 5 from ${ratingCount} review${ratingCount === 1 ? "" : "s"}`
                : "No reviews yet"
            }
          >
            <Star
              className={`w-3 h-3 ${
                ratingCount > 0
                  ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
                  : "text-[#4b5e53] dark:text-zinc-500"
              }`}
            />
            <span>{ratingCount > 0 ? `${ratingAverage.toFixed(1)} (${ratingCount})` : "New"}</span>
          </span>

          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e9f0ea] dark:bg-[#18181b] border border-[#cbdad0] dark:border-zinc-800 text-emerald-800 dark:text-emerald-400 font-bold"
            title={`${commentCount} comment${commentCount === 1 ? "" : "s"}`}
          >
            <MessageSquare className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
            <span>{commentCount === 1 ? "1 comment" : `${commentCount} comments`}</span>
          </span>
        </div>

        {/* Metadata (Date & Read Time) */}
        <div className="flex items-center gap-3 text-[11px] text-[#4b5e53] dark:text-zinc-500 pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#4b5e53] dark:text-zinc-600" />
            <span>{formattedDate}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-teal-700 dark:text-terminal-cyan">
            <Clock className="w-3 h-3" />
            <span>{`${readTime} min read`}</span>
          </span>
        </div>
      </div>

      {/* Reader CTA Link */}
      <div className="pt-3 border-t border-[#cbdad0] dark:border-zinc-800/80 flex items-center justify-between">
        <Link
          to={`/blogs/${slug}`}
          className="text-xs text-emerald-700 dark:text-terminal-green font-bold hover:underline inline-flex items-center gap-1 group-hover:translate-x-1 active:translate-x-2 transition-transform"
        >
          <span>Read Full Article</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/blogs"
          className="text-[11px] text-[#4b5e53] dark:text-zinc-500 hover:text-[#0f1a14] dark:hover:text-zinc-300"
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
    rating_average: PropTypes.number,
    rating_count: PropTypes.number,
    comment_count: PropTypes.number,
    published_at: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    updated_at: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    created_at: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  }),
  className: PropTypes.string,
};
