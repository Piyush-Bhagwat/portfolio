import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Clock, Calendar, ArrowRight, BookOpen } from "lucide-react";
import { TagBadge } from "../brutalist";
import { getOptimizedImageUrl } from "../../services/cloudinary.js";
import { calculateReadTime } from "../../utils/blogUtils.js";

/**
 * Defensive date formatter for public blog cards
 */
export function formatCardDate(timestamp) {
  if (!timestamp) return "Recent";
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return String(timestamp);
}

/**
 * BlogCard - Neo-Brutalist Article Card for Bento Grid Index
 */
export default function BlogCard({
  post,
  featured = false,
  onTagClick,
  className = "",
}) {
  if (!post) return null;

  const readTime =
    post.read_time_minutes ||
    calculateReadTime(post.content_markdown || "");

  const displayDate = formatCardDate(
    post.published_at || post.updated_at || post.created_at
  );

  const tags = Array.isArray(post.tags) ? post.tags : [];
  const postUrl = `/blogs/${post.slug || post.id}`;

  return (
    <article
      className={`
        group relative flex flex-col justify-between
        bg-white dark:bg-zinc-950 border-2 border-[#1b2e23] dark:border-zinc-800
        hover:border-emerald-700 dark:hover:border-terminal-green
        shadow-brutal-forest dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        hover:shadow-[6px_6px_0px_0px_#1b2e23] dark:hover:shadow-[6px_6px_0px_0px_rgba(16,185,129,0.7)]
        hover:-translate-x-0.5 hover:-translate-y-0.5
        transition-all duration-200 overflow-hidden font-mono
        ${featured ? "md:col-span-2 lg:col-span-2" : ""}
        ${className}
      `.trim()}
    >
      <div>
        {/* Cover Banner or Terminal Placeholder */}
        {post.cover_image_url ? (
          <div className="relative w-full aspect-video md:aspect-[21/9] max-h-56 bg-[#e9f0ea] dark:bg-zinc-900 border-b-2 border-[#cbdad0] dark:border-zinc-800 overflow-hidden">
            <img
              src={getOptimizedImageUrl(post.cover_image_url, {
                width: 800,
                quality: "auto",
              })}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {featured && (
              <div className="absolute top-3 left-3 bg-emerald-600 dark:bg-terminal-green text-white dark:text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Featured Article
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-24 sm:h-32 bg-[#e9f0ea] dark:bg-zinc-900 border-b-2 border-[#cbdad0] dark:border-zinc-800 flex items-center justify-between px-5 select-none overflow-hidden">
            <div className="flex items-center gap-2 text-[#4b5e53] dark:text-zinc-600">
              <BookOpen className="w-6 h-6 text-[#4b5e53] dark:text-zinc-500" />
              <span className="text-xs font-bold text-[#0f1a14] dark:text-zinc-400">
                technical_publication.md
              </span>
            </div>
            <span className="text-[10px] text-[#4b5e53] dark:text-zinc-600 uppercase tracking-widest">
              sys.pub.v2
            </span>
          </div>
        )}

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Metadata: Date & Reading Time */}
          <div className="flex items-center justify-between text-[11px] text-[#4b5e53] dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#4b5e53] dark:text-zinc-500" />
              <span>{displayDate}</span>
            </span>

            <span className="flex items-center gap-1 text-teal-700 dark:text-terminal-cyan">
              <Clock className="w-3.5 h-3.5" />
              <span>{`${readTime} min read`}</span>
            </span>
          </div>

          {/* Title */}
          <h2 className="text-base sm:text-lg font-bold text-[#0f1a14] dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-terminal-green transition-colors leading-snug line-clamp-2">
            <Link to={postUrl} className="focus:outline-none">
              {post.title}
            </Link>
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xs text-[#4b5e53] dark:text-zinc-400 leading-relaxed line-clamp-3 font-sans">
              {post.excerpt}
            </p>
          )}

          {/* Category Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    if (onTagClick) {
                      e.preventDefault();
                      e.stopPropagation();
                      onTagClick(tag);
                    }
                  }}
                  className="focus:outline-none"
                >
                  <TagBadge variant="terminal" size="sm">
                    {tag}
                  </TagBadge>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Link */}
      <div className="px-5 pb-5 pt-2 border-t border-[#cbdad0] dark:border-zinc-900 flex items-center justify-between">
        <Link
          to={postUrl}
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-terminal-green hover:underline focus:outline-none group/link"
        >
          <span>Read Article</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
        <span className="text-[10px] text-[#4b5e53] dark:text-zinc-600 font-mono">
          /{post.slug || post.id}
        </span>
      </div>
    </article>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string.isRequired,
    slug: PropTypes.string,
    excerpt: PropTypes.string,
    cover_image_url: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    read_time_minutes: PropTypes.number,
    content_markdown: PropTypes.string,
    published_at: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.instanceOf(Date)]),
    updated_at: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.instanceOf(Date)]),
    created_at: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.instanceOf(Date)]),
  }).isRequired,
  featured: PropTypes.bool,
  onTagClick: PropTypes.func,
  className: PropTypes.string,
};
